#!make

-include .env

export $(shell sed 's/=.*//' .env)
export COMMIT_SHA?=$(shell git rev-parse --short=7 HEAD)
export IMAGE_TAG=${COMMIT_SHA}
export PROJECT:=enhanced-travel-screening
export ENV_PREFIX?=ets
export ENV_SUFFIX?=dev
export LAMBDA_FUNC?=phacToSbc
export VERSION_LABEL:=$(ENV_PREFIX)-$(ENV_SUFFIX)-$(IMAGE_TAG)
.DEFAULT_GOAL:=print-status

print-status:
	@echo "Current Settings:"
	@echo "ACCOUNT ID: $(ACCOUNT_ID)"
	@echo "S3 BUCKET: $(S3_BUCKET)"
	@echo "PROJECT: $(PROJECT)"
	@echo "REGION: $(REGION)"
	@echo "PROFILE: $(PROFILE)"
	@echo "COMMIT_SHA: $(COMMIT_SHA)"
	@echo "IMAGE_TAG: $(IMAGE_TAG)"
	@echo "VERSION_LABEL: $(VERSION_LABEL)"

# Local Development

build-local:
	@echo "Building local app image"
	@docker-compose -f docker-compose.dev.yml build

run-local:
	@echo "Running local app container"
	@docker-compose -f docker-compose.dev.yml up

run-local-db:
	@echo "Running local DB container"
	@docker-compose -f docker-compose.dev.yml up mongodb

run-e2e-test:
	@npm test --prefix server

run-local-lambda-phacToSbc:
	@aws lambda invoke --endpoint http://localhost:9001 --no-sign-request --function-name index.handler --cli-binary-format raw-in-base64-out --payload '{}' output.json

run-local-lambda-etsToSbc:
	@aws lambda invoke --endpoint http://localhost:9002 --no-sign-request --function-name index.handler --cli-binary-format raw-in-base64-out --payload '{}' output.json

close-local:
	@echo "Stopping local app container"
	@docker-compose -f docker-compose.dev.yml down

local-db-seed:
	@echo "Seeding local DB container"
	@docker exec -it $(PROJECT)-server npm run db:seed

local-server-tests:
	@echo "Running tests in local app container"
	@docker exec -it $(PROJECT)-server npm test

# Pipeline

get-latest-env-name:
	@aws elasticbeanstalk describe-environments | jq -cr '.Environments | .[] | select(.Status == "Ready" and (.EnvironmentName | test("^$(ENV_PREFIX)-$(ENV_SUFFIX)(-[0-9]+)?$$"))) | .EnvironmentName' | sort | tail -n 1

create-new-env-name:
	@echo $(ENV_PREFIX)-$(ENV_SUFFIX)-$(shell date '+%Y%m%d%H%M')

build-image:
	@echo "Building image $(PROJECT):$(IMAGE_TAG)"
	@docker build -t $(PROJECT):$(IMAGE_TAG) --build-arg VERSION=$(IMAGE_TAG) .

push-image:
	@echo "Pushing image $(PROJECT):$(IMAGE_TAG) to ECR"
	@aws ecr get-login-password | docker login --username AWS --password-stdin $(ACCOUNT_ID).dkr.ecr.$(REGION).amazonaws.com
	@docker tag $(PROJECT):$(IMAGE_TAG) $(ACCOUNT_ID).dkr.ecr.$(REGION).amazonaws.com/$(PROJECT):$(IMAGE_TAG)
	@docker push $(ACCOUNT_ID).dkr.ecr.$(REGION).amazonaws.com/$(PROJECT):$(IMAGE_TAG)

validate-image:
	@echo "Ensuring $(PROJECT):$(IMAGE_TAG) is in container registry"
	@aws ecr describe-images --repository-name=$(PROJECT) --image-ids=imageTag=$(IMAGE_TAG)

promote-image:
	@echo "Creating deployment artifact for commit $(IMAGE_TAG) and promoting image to $(ENV_SUFFIX)"
	@echo '{"AWSEBDockerrunVersion": 2, "containerDefinitions": [{ "essential": true, "name": "application", "image": "$(ACCOUNT_ID).dkr.ecr.$(REGION).amazonaws.com/$(PROJECT):$(IMAGE_TAG)", "memory": 256, "portMappings": [{ "containerPort": 80, "hostPort": 80 }] }] }' > Dockerrun.aws.json
	@zip -r $(VERSION_LABEL).zip  Dockerrun.aws.json
	@aws s3 cp $(VERSION_LABEL).zip s3://$(S3_BUCKET)/$(PROJECT)/$(VERSION_LABEL).zip
	@aws elasticbeanstalk create-application-version --application-name $(PROJECT) --version-label $(VERSION_LABEL) --source-bundle S3Bucket="$(S3_BUCKET)",S3Key="$(PROJECT)/$(VERSION_LABEL).zip" || :
	@aws elasticbeanstalk update-environment --application-name $(PROJECT) --environment-name $(DESTINATION_ENV) --version-label $(VERSION_LABEL)

# Git Tagging Aliases

tag-dev:
	@echo "Deploying $(PROJECT):$(IMAGE_TAG) to dev env"
	@git tag -fa dev -m "Deploying $(PROJECT):$(IMAGE_TAG) to dev env" $(IMAGE_TAG)
	@git push --force origin refs/tags/dev:refs/tags/dev

tag-staging:
	@echo "Deploying $(PROJECT):$(IMAGE_TAG) to staging env"
	@git tag -fa staging -m "Deploying $(PROJECT):$(IMAGE_TAG) to staging env" $(IMAGE_TAG)
	@git push --force origin refs/tags/staging:refs/tags/staging

tag-prod:
	@echo "Deploying $(PROJECT):$(IMAGE_TAG) to prod env"
	@git tag -fa prod -m "Deploying $(PROJECT):$(IMAGE_TAG) to prod env" $(IMAGE_TAG)
	@git push --force origin refs/tags/prod:refs/tags/prod

tag-lambda-prod:
	@echo "Deploying lambda functions code to prod AWS Lambda"
	@git tag -fa lambda-prod -m "Deploying lambda function code to prod AWS Lambda" $(IMAGE_TAG)
	@git push --force origin refs/tags/lambda-prod:refs/tags/lambda-prod
