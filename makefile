#!make

-include .env

export $(shell sed 's/=.*//' .env)
export GIT_LOCAL_BRANCH?=$(shell git rev-parse --abbrev-ref HEAD)
export COMMIT_SHA?=$(shell git rev-parse --short=7 HEAD)
export IMAGE_TAG=${COMMIT_SHA}

VERSION            := $(subst v,,$(shell cat version.txt))
VERSION_PARTS      := $(subst ., ,$(VERSION))
VERSION_SAFE	   := $(shell echo ${VERSION} | tr '.' '_' )
VERSION_MAJOR      := $(word 1,$(VERSION_PARTS))
VERSION_MINOR      := $(word 2,$(VERSION_PARTS))
VERSION_PATCH      := $(word 3,$(VERSION_PARTS))
VERSION_MINOR_FULL := $(VERSION_MAJOR).$(VERSION_MINOR)
export IMAGE_VERSION=v$(VERSION)
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
# Versioned  Build commands #
##########################################

version-build:
	@echo "+\n++ Performing build of Docker images...\n+"
	@docker-compose -f docker-compose.yml build

version-push:
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

version-deploy-dev:
	@aws --profile $(PROFILE) elasticbeanstalk update-environment --application-name $(PROJECT) --environment-name $(PROJECT)-dev --version-label v$(VERSION)

version-deploy-staging:
	@aws --profile $(PROFILE) elasticbeanstalk update-environment --application-name $(PROJECT) --environment-name $(PROJECT)-test2 --version-label v$(VERSION)

version-deploy-pod:
	@aws --profile $(PROFILE) elasticbeanstalk update-environment --application-name $(PROJECT) --environment-name $(PROJECT)-prod --version-label v$(VERSION)
