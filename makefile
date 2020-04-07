#!make

include .env

export $(shell sed 's/=.*//' .env)
export GIT_LOCAL_BRANCH?=$(shell git rev-parse --abbrev-ref HEAD)
export DEPLOY_DATE?=$(shell date '+%Y%m%d%H%M')

define deployTag
"${PROJECT}-${DEPLOY_DATE}"
endef


#################
# Status Output #
#################

print-status:
	@echo " +---------------------------------------------------------+ "
	@echo " | Current Settings                                        | "
	@echo " +---------------------------------------------------------+ "
	@echo " | ACCOUNT ID: $(ACCOUNT_ID) "
	@echo " | S3 BUCKET: $(S3_BUCKET) "
	@echo " | PROJECT: $(PROJECT) "
	@echo " | REGION: $(REGION) "
	@echo " | PROFILE: $(PROFILE) "
	@echo " | DEPLOY ENV: $(DEPLOY_ENV) "
	@echo " | MERGE BRANCH: $(MERGE_BRANCH) "
	@echo " +---------------------------------------------------------+ "


pipeline-deploy-dev:        | setup-development-env pipeline-build pipeline-push pipeline-deploy-prep pipeline-deploy-version


####################
# Utility commands #
####################

# Set an AWS profile for pipeline
setup-aws-profile:
	@echo "+\n++ Make: Setting AWS Profile...\n+"
	@aws configure set aws_access_key_id $(AWS_ACCESS_KEY_ID) --profile $(PROFILE)
	@aws configure set aws_secret_access_key $(AWS_SECRET_ACCESS_KEY) --profile $(PROFILE)

# Generates ECR (Elastic Container Registry) repos, given the proper credentials
create-ecr-repos:
	@echo "+\n++ Creating EC2 Container repositories...\n+"
	@$(shell aws ecr get-login --no-include-email --profile $(PROFILE) --region $(REGION))
	@aws ecr create-repository --profile $(PROFILE) --region $(REGION) --repository-name $(PROJECT) || :
	@aws iam attach-role-policy --role-name aws-elasticbeanstalk-ec2-role --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly --profile $(PROFILE) --region $(REGION)

setup-development-env:
	@echo "+\n++ Make: Preparing project for dev environment...\n+"
	@cp .config/.env.dev ./.env


##########################################
# Pipeline build and deployment commands #
##########################################

pipeline-build:
	@echo "+\n++ Performing build of Docker images...\n+"
	@echo "Tagging images with: $(GIT_LOCAL_BRANCH)"
	@docker-compose -f docker-compose.yml build

pipeline-push:
	@echo "+\n++ Pushing image to Dockerhub...\n+"
	@$(shell aws ecr get-login --no-include-email --region $(REGION) --profile $(PROFILE))
	@docker tag $(PROJECT):$(GIT_LOCAL_BRANCH) $(ACCOUNT_ID).dkr.ecr.$(REGION).amazonaws.com/$(PROJECT):$(MERGE_BRANCH)
	@docker push $(ACCOUNT_ID).dkr.ecr.$(REGION).amazonaws.com/$(PROJECT):$(MERGE_BRANCH)

pipeline-deploy-prep:
	@echo "+\n++ Creating Dockerrun.aws.json file...\n+"
	@.build/build_dockerrun.sh > Dockerrun.aws.json

pipeline-deploy-version:
	@echo "+\n++ Deploying to Elasticbeanstalk...\n+"
	@zip -r $(call deployTag).zip  Dockerrun.aws.json
	@aws --profile $(PROFILE) configure set region $(REGION)
	@aws --profile $(PROFILE) s3 cp $(call deployTag).zip s3://$(S3_BUCKET)/$(PROJECT)/$(call deployTag).zip
	@aws --profile $(PROFILE) elasticbeanstalk create-application-version --application-name $(PROJECT) --version-label $(call deployTag) --source-bundle S3Bucket="$(S3_BUCKET)",S3Key="$(PROJECT)/$(call deployTag).zip"
	@aws --profile $(PROFILE) elasticbeanstalk update-environment --application-name $(PROJECT) --environment-name $(DEPLOY_ENV) --version-label $(call deployTag)

pipeline-healthcheck:
	@aws --profile $(PROFILE) elasticbeanstalk describe-environments --application-name $(PROJECT) --environment-name $(DEPLOY_ENV) --query 'Environments[*].{Status: Status, Health: Health}'
