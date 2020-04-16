#!make

-include .env

export $(shell sed 's/=.*//' .env)
export GIT_LOCAL_BRANCH?=$(shell git rev-parse --abbrev-ref HEAD)
export DEPLOY_DATE?=$(shell date '+%Y%m%d%H%M')
export COMMIT_SHA?=$(shell git rev-parse --short=7 HEAD)
# original IMAGE_TAG=${DEPLOY_DATE}-${COMMIT_SHA}
export IMAGE_TAG=${COMMIT_SHA}

define deployTag
"${PROJECT}-${DEPLOY_DATE}"
endef

VERSION            := $(subst v,,$(shell cat version.txt))
VERSION_PARTS      := $(subst ., ,$(VERSION))
VERSION_SAFE	   := $(shell echo ${VERSION} | tr '.' '_' )
VERSION_MAJOR      := $(word 1,$(VERSION_PARTS))
VERSION_MINOR      := $(word 2,$(VERSION_PARTS))
VERSION_PATCH      := $(word 3,$(VERSION_PARTS))
VERSION_MINOR_FULL := $(VERSION_MAJOR).$(VERSION_MINOR)
export IMAGE_VERSION=$(VERSION)
export IMAGE_PACKAGE=${PROJECT}-v${VERSION_SAFE}

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
	@echo " | GIT LOCAL BRANCH: $(GIT_LOCAL_BRANCH) "
	@echo " | COMMIT_SHA: $(COMMIT_SHA) "
	@echo " | IMAGE_TAG: $(IMAGE_TAG) "
	@echo " | VERSION: $(VERSION) "
	@echo " | VERSION_SAFE: $(VERSION_SAFE) "
	@echo " | VERSION_MINOR_FULL: $(VERSION_MINOR_FULL) "
	@echo " | IMAGE_PACKAGE: $(IMAGE_PACKAGE) "
	@echo " +---------------------------------------------------------+ "

# If no .env file exists in the project root dir, run `make setup-development-env` and fill in credentials
pipeline-deploy-dev: | pipeline-build pipeline-push pipeline-deploy-prep pipeline-deploy-version


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
	@echo "Building images with: $(GIT_LOCAL_BRANCH)"
	@docker-compose -f docker-compose.yml build

pipeline-push:
	@echo "+\n++ Pushing image to Dockerhub...\n+"
	# @$(shell aws ecr get-login --no-include-email --region $(REGION) --profile $(PROFILE))
	@aws --region $(REGION) --profile $(PROFILE) ecr get-login-password | docker login --username AWS --password-stdin $(ACCOUNT_ID).dkr.ecr.$(REGION).amazonaws.com
	@docker tag $(PROJECT):$(GIT_LOCAL_BRANCH) $(ACCOUNT_ID).dkr.ecr.$(REGION).amazonaws.com/$(PROJECT):$(IMAGE_TAG)
	@docker push $(ACCOUNT_ID).dkr.ecr.$(REGION).amazonaws.com/$(PROJECT):$(IMAGE_TAG)

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

##########################################
# GH deployment commands #
##########################################

gh-pipeline-push:
	@echo "+\n++ Pushing image to Dockerhub...\n+"
	# @$(shell aws ecr get-login --no-include-email --region $(REGION) --profile $(PROFILE))
	@aws --region $(REGION) ecr get-login-password | docker login --username AWS --password-stdin $(ACCOUNT_ID).dkr.ecr.$(REGION).amazonaws.com
	@docker tag $(PROJECT):$(GIT_LOCAL_BRANCH) $(ACCOUNT_ID).dkr.ecr.$(REGION).amazonaws.com/$(PROJECT):$(IMAGE_TAG)
	@docker push $(ACCOUNT_ID).dkr.ecr.$(REGION).amazonaws.com/$(PROJECT):$(IMAGE_TAG)

gh-pipeline-deploy-prep:
	@echo "+\n++ Creating Dockerrun.aws.json file...\n+"
	@.build/build_dockerrun.sh > Dockerrun.aws.json

gh-pipeline-deploy-version:
	@echo "+\n++ Deploying to Elasticbeanstalk...\n+"
	@zip -r $(call deployTag).zip  Dockerrun.aws.json
	@aws configure set region $(REGION)
	@aws s3 cp $(call deployTag).zip s3://$(S3_BUCKET)/$(PROJECT)/$(call deployTag).zip
	@aws elasticbeanstalk create-application-version --application-name $(PROJECT) --version-label $(call deployTag) --source-bundle S3Bucket="$(S3_BUCKET)",S3Key="$(PROJECT)/$(call deployTag).zip"
	@aws elasticbeanstalk update-environment --application-name $(PROJECT) --environment-name $(DEPLOY_ENV) --version-label $(call deployTag)

##########################################
# IMG Promotion commands #
##########################################
pipeline-promote-prep:
	@echo "--------------------------------------------------------------------------------";
	@echo "NOTE: This requires the PROMOTE_FROM_TAG and PROMOTE_TO_TAG be set in .build/image_promote.sh"
	@echo "--------------------------------------------------------------------------------";
	@echo "\nPromoting to Image Registry...\n"
	@.build/promote_img.sh

pipeline-promote-staging:
	@echo "+\n++ Promoting to Elasticbeanstalk [PRE-PROD/STAGING]...\n+"
	@zip -r $(call deployTag)_staging.zip  Dockerrun.aws.json
	@aws --profile $(PROFILE) configure set region $(REGION)
	@aws --profile $(PROFILE) s3 cp $(call deployTag)_staging.zip s3://$(S3_BUCKET)/$(PROJECT)/$(call deployTag)_staging.zip
	@aws --profile $(PROFILE) elasticbeanstalk create-application-version --application-name $(PROJECT) --version-label $(call deployTag) --source-bundle S3Bucket="$(S3_BUCKET)",S3Key="$(PROJECT)/$(call deployTag)_staging.zip"
	@aws --profile $(PROFILE) elasticbeanstalk update-environment --application-name $(PROJECT) --environment-name enhanced-travel-screening-test2 --version-label $(call deployTag)

pipeline-promote-prod:
	@echo "+\n++ Promoting to Elasticbeanstalk [PRODUCTION]...\n+"
	@zip -r $(call deployTag)_prod.zip  Dockerrun.aws.json
	@aws --profile $(PROFILE) configure set region $(REGION)
	@aws --profile $(PROFILE) s3 cp $(call deployTag)_prod.zip s3://$(S3_BUCKET)/$(PROJECT)/$(call deployTag)_prod.zip
	@aws --profile $(PROFILE) elasticbeanstalk create-application-version --application-name $(PROJECT) --version-label $(call deployTag) --source-bundle S3Bucket="$(S3_BUCKET)",S3Key="$(PROJECT)/$(call deployTag)_prod.zip"
	@aws --profile $(PROFILE) elasticbeanstalk update-environment --application-name $(PROJECT) --environment-name enhanced-travel-screening-prod --version-label $(call deployTag)

##########################################
# Updated Build commands #
##########################################

version-build:
	@echo "+\n++ Performing build of Docker images...\n+"
	@docker-compose -f docker-compose.yml build

version-push:
	@echo "+\n++ Pushing image and tags to Container Registry...\n+"
	# @$(shell aws ecr get-login --no-include-email --region $(REGION) --profile $(PROFILE))
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

version-deploy-dev:
	@aws --profile $(PROFILE) elasticbeanstalk update-environment --application-name $(PROJECT) --environment-name enhanced-travel-screening-dev --version-label v$(VERSION)

version-deploy-staging:
	@aws --profile $(PROFILE) elasticbeanstalk update-environment --application-name $(PROJECT) --environment-name enhanced-travel-screening-test2 --version-label v$(VERSION)

version-deploy-pod:
	@aws --profile $(PROFILE) elasticbeanstalk update-environment --application-name $(PROJECT) --environment-name enhanced-travel-screening-prod --version-label v$(VERSION)
