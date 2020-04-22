#!make

-include .env

export $(shell sed 's/=.*//' .env)
export GIT_LOCAL_BRANCH?=$(shell git rev-parse --abbrev-ref HEAD)
export COMMIT_SHA?=$(shell git rev-parse --short=7 HEAD)
export IMAGE_TAG=${COMMIT_SHA}


##############################################################
# Define default environment variables for local development #
##############################################################
export PROJECT := $(or $(PROJECT),ets)
export DB_USER := $(or $(DB_USER),development)
export DB_PASSWORD := $(or $(DB_PASSWORD),development)
export DB_NAME := $(or $(DB_NAME),development)
export DB_SERVER := $(or $(DB_SERVER),mongodb)

##############################################################
# Define  variables for versioning builds and deployments    #
##############################################################
VERSION_TEXT       := $(subst v,,$(shell cat version.txt))
VERSION_PARTS      := $(subst ., ,$(VERSION_TEXT))
VERSION_MAJOR      := $(word 1,$(VERSION_PARTS))
VERSION_MINOR      := $(word 2,$(VERSION_PARTS))
VERSION_PATCH      := $(or $(GITHUB_RUN_NUMBER),0)
VERSION_MINOR_FULL := $(VERSION_MAJOR).$(VERSION_MINOR)
VERSION_SAFE	   := ${VERSION_MAJOR}_${VERSION_MINOR}_${VERSION_PATCH}
VERSION			   := ${VERSION_MAJOR}.${VERSION_MINOR}.${VERSION_PATCH}
export IMAGE_VERSION=v$(VERSION)
export IMAGE_PACKAGE=${PROJECT}-v${VERSION_SAFE}

#################
# Status Output #
#################

print-status: ## -- Target : Displays Environment Settings
	@echo " +---------------------------------------------------------+ "
	@echo " | Current Settings                                        | "
	@echo " +---------------------------------------------------------+ "
	@echo " | ACCOUNT ID: $(ACCOUNT_ID) "
	@echo " | S3 BUCKET: $(S3_BUCKET) "
	@echo " | PROJECT: $(PROJECT) "
	@echo " | REGION: $(REGION) "
	@echo " | PROFILE: $(PROFILE) "
	@echo " | GIT LOCAL BRANCH: $(GIT_LOCAL_BRANCH) "
	@echo " | COMMIT_SHA: $(COMMIT_SHA) "
	@echo " | IMAGE_TAG: $(IMAGE_TAG) "
	@echo " | VERSION: $(VERSION) "
	@echo " | VERSION_SAFE: $(VERSION_SAFE) "
	@echo " | VERSION_MAJOR: $(VERSION_MAJOR) "
	@echo " | VERSION_MINOR: $(VERSION_MINOR) "
	@echo " | VERSION_MINOR_FULL: $(VERSION_MINOR_FULL) "
	@echo " | VERSION_PATCH: $(VERSION_PATCH) "
	@echo " | IMAGE_VERSION: $(IMAGE_VERSION) "
	@echo " | IMAGE_PACKAGE: $(IMAGE_PACKAGE) "
	@echo " +---------------------------------------------------------+ "

local:  | build-local run-local ## Task-Alias -- Run the steps for local development

#####################
# Local Development #
#####################

build-local: ## -- Target : Builds the local development containers.
	@echo "+\n++ Make: Building local Docker image ...\n+"
	@docker-compose -f docker-compose.dev.yml build

run-local: ## -- Target : Runs the local development containers.
	@echo "+\n++ Make: Running locally ...\n+"
	@docker-compose -f docker-compose.dev.yml up

run-local-db: ## -- Target : Runs the local development containers.
	@echo "+\n++ Make: Running db locally ...\n+"
	@docker-compose -f docker-compose.dev.yml up mongodb

close-local: ## -- Target : Closes the local development containers.
	@echo "+\n++ Make: Closing local container ...\n+"
	@docker-compose -f docker-compose.dev.yml down

local-client-workspace: ## -- Target : Execs into the client workspace
	@docker exec -it $(PROJECT)-client bash

local-server-workspace: ## -- Target : Execs into the server workspace
	@docker exec -it $(PROJECT)-server bash

local-db-seed: ## -- Target : Seeds the local database
	@docker exec -it $(PROJECT)-server npm run db:seed

local-db-migration: ## -- Target : Runs db migrations
	@docker exec -it $(PROJECT)-server npm run db:migration

local-server-tests: ## -- Target : Runs units-tests
	@docker exec -it $(PROJECT)-server npm test


####################
# Utility commands #
####################

setup-aws-profile: ## -- Target : Sets an AWS profile for pipelines
	@echo "+\n++ Make: Setting AWS Profile...\n+"
	@aws configure set aws_access_key_id $(AWS_ACCESS_KEY_ID) --profile $(PROFILE)
	@aws configure set aws_secret_access_key $(AWS_SECRET_ACCESS_KEY) --profile $(PROFILE)

create-ecr-repos: ## -- Target : (RUN ONLY ONCE) Generates the container registry for a new project
	@echo "+\n++ Creating EC2 Container repositories...\n+"
	@$(shell aws ecr get-login --no-include-email --profile $(PROFILE) --region $(REGION))
	@aws ecr create-repository --profile $(PROFILE) --region $(REGION) --repository-name $(PROJECT) || :
	@aws iam attach-role-policy --role-name aws-elasticbeanstalk-ec2-role --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly --profile $(PROFILE) --region $(REGION)


##########################################
# Versioned  Build commands #
##########################################
tag-dev:  ## -- Target : Tags the current branch with DEV (trigger gh-actions)
	@git tag -fa dev -m "Deploying $(GIT_LOCAL_BRANCH):$(VERSION) to DEV env" $(VERSION)
	@git push --force origin refs/tags/dev:refs/tags/dev

tag-staging: ## -- Target : Tags the current branch with STAGING (trigger gh-actions)
	@git tag -fa staging -m "Promoting $(GIT_LOCAL_BRANCH):$(VERSION) to STAGING env" $(VERSION)
	@git push --force origin refs/tags/staging:refs/tags/staging

tag-prod: ## -- Target : Tags the current branch with PROD (trigger gh-actions)
	@git tag -fa prod -m "Promoting $(GIT_LOCAL_BRANCH):$(VERSION) to PROD env" $(VERSION)
	@git push --force origin refs/tags/prod:refs/tags/prod

version-build: ## -- Target : Builds the application images
	@echo "+\n++ Performing build of Docker images...\n+"
	@docker-compose -f docker-compose.yml build

version-push: ## -- Target : Tags and pushes images, task-definitions and application-versions
	@echo "+\n++ Pushing image and tags to Container Registry...\n+"
	@aws --region $(REGION) ecr get-login-password | docker login --username AWS --password-stdin $(ACCOUNT_ID).dkr.ecr.$(REGION).amazonaws.com
	@echo "Tagging with SHA ${IMAGE_TAG} .."
	@docker tag $(PROJECT):$(GIT_LOCAL_BRANCH) $(ACCOUNT_ID).dkr.ecr.$(REGION).amazonaws.com/$(PROJECT):$(IMAGE_TAG)
	@docker push $(ACCOUNT_ID).dkr.ecr.$(REGION).amazonaws.com/$(PROJECT):$(IMAGE_TAG)
	@echo "Tagging with MAJOR v${VERSION_MAJOR} .."
	@docker tag $(PROJECT):$(GIT_LOCAL_BRANCH) $(ACCOUNT_ID).dkr.ecr.$(REGION).amazonaws.com/$(PROJECT):v$(VERSION_MAJOR)
	@docker push $(ACCOUNT_ID).dkr.ecr.$(REGION).amazonaws.com/$(PROJECT):v$(VERSION_MAJOR)
	@echo "Tagging with MINOR v${VERSION_MINOR_FULL} .."
	@docker tag $(PROJECT):$(GIT_LOCAL_BRANCH) $(ACCOUNT_ID).dkr.ecr.$(REGION).amazonaws.com/$(PROJECT):v$(VERSION_MINOR_FULL)
	@docker push $(ACCOUNT_ID).dkr.ecr.$(REGION).amazonaws.com/$(PROJECT):v$(VERSION_MINOR_FULL)
	@echo "Tagging with PATCH v${VERSION} .."
	@docker tag $(PROJECT):$(GIT_LOCAL_BRANCH) $(ACCOUNT_ID).dkr.ecr.$(REGION).amazonaws.com/$(PROJECT):v$(VERSION)
	@docker push $(ACCOUNT_ID).dkr.ecr.$(REGION).amazonaws.com/$(PROJECT):v$(VERSION)
	@echo "Building Container Task Definition for $(VERSION) ..."
	@.build/build_dockerrun.sh > Dockerrun.aws.json
	@zip -r $(IMAGE_PACKAGE).zip  Dockerrun.aws.json
	@echo "Pushing Task Definition to S3 ..."
	@aws configure set region $(REGION)
	@aws s3 cp $(IMAGE_PACKAGE).zip s3://$(S3_BUCKET)/$(PROJECT)/$(IMAGE_PACKAGE).zip
	@echo "Creating EB Version from Task Definition ..."
	@aws --profile $(PROFILE) elasticbeanstalk create-application-version --application-name $(PROJECT) --version-label v$(VERSION) --source-bundle S3Bucket="$(S3_BUCKET)",S3Key="$(PROJECT)/$(IMAGE_PACKAGE).zip"

version-deploy-dev: ## -- Target : Promotes a version to the DEV environment
	@aws --profile $(PROFILE) elasticbeanstalk update-environment --application-name $(PROJECT) --environment-name $(PROJECT)-dev --version-label v$(VERSION)

version-deploy-staging: ## -- Target : Promotes a version to the STAGING environment
	@aws --profile $(PROFILE) elasticbeanstalk update-environment --application-name $(PROJECT) --environment-name $(PROJECT)-staging --version-label v$(VERSION)

version-deploy-pod: ## -- Target : Promotes a version to the PROD environment
	@aws --profile $(PROFILE) elasticbeanstalk update-environment --application-name $(PROJECT) --environment-name $(PROJECT)-prod --version-label v$(VERSION)

##############################
# Supporting Commands        #
##############################

help:  ## ** Display this help screen.
	@echo ""
	@echo "# ------------------------------------------------------------ "
	@echo "# Makefile Help - ${PROJECT}     "
	@echo "# ------------------------------------------------------------ "
	@echo ""
	@grep -h -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
