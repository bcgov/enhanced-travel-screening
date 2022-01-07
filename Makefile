#!make

-include .env
export $(shell sed 's/=.*//' .env)

ENV_NAME ?= dev
export AWS_REGION ?= ca-central-1


TERRAFORM_DIR = terraform/
PROJECT_CODE = $(LZ2_PROJECT)-$(ENV_NAME)


export PROJECT_NAME = ets
export LZ2_PROJECT = klwrig

# Git Stuff 
export COMMIT_SHA?=$(shell git rev-parse --short=7 HEAD)
export REPO_LOCATION=$(shell git rev-parse --show-toplevel)

define TFVARS_DATA
project_name = "$(PROJECT_NAME)"
target_env = "$(ENV_NAME)"
project_code = "$(PROJECT_CODE)"
git_version = "ETS-$(COMMIT_SHA)"
api_zip = "build/server.zip"
ets_to_sbc_zip = "build/etsToSbc.zip"
phac_to_sbc_zip = "build/phacToSbc.zip"
slack_zip = "build/slack.zip"

endef
export TFVARS_DATA

define TF_BACKEND_CFG
workspaces { name = "$(LZ2_PROJECT)-$(ENV_NAME)" }
hostname     = "app.terraform.io"
organization = "bcgov"
endef
export TF_BACKEND_CFG

# ============================================================= #
# Terraform automation
# ============================================================= #

env-print: 
	@tput setaf 1; 
	@echo -e "\n\n"
	@echo -e "=========================================================="
	@echo -e "!!!!! You are terraforming $(ENV_NAME) !!!!!"
	@echo -e "=========================================================="
	@echo -e "\n\n"
	@tput setaf 9

write-config-tf: 
	@echo "$$TFVARS_DATA" > $(TERRAFORM_DIR)/.auto.tfvars
	@echo "$$TF_BACKEND_CFG" > $(TERRAFORM_DIR)/backend.hcl

init: write-config-tf
	# Initializing the terraform environment
	@terraform -chdir=$(TERRAFORM_DIR) init -input=false \
		-reconfigure \
		-backend-config=backend.hcl

plan: init
	# Creating all AWS infrastructure.
	@terraform -chdir=$(TERRAFORM_DIR) plan

apply: init
	# Creating all AWS infrastructure.
	@terraform -chdir=$(TERRAFORM_DIR) apply -auto-approve -input=false

force-unlock: init
	terraform -chdir=$(TERRAFORM_DIR) force-unlock $(LOCK_ID)

destroy: init
	terraform -chdir=$(TERRAFORM_DIR) destroy

# ============================================================= #
# Builds 
# ============================================================= #

build-client:
	rm -rf ./terraform/build/client || true
	npm install --prefix client
	npm run --prefix client build
	mkdir -p ./terraform/build
	mv ./client/build ./terraform/build/client

build-lambdas:
	@echo -e "\n\n\n============================="
	@echo "Cleaning up previous builds"
	@echo "============================="
	rm -rf ./terraform/build/server || true
	rm -rf ./server/dist || true
	mkdir -p ./terraform/build
	
	
	@echo -e "\n\n\n============================="
	@echo "Install Node Modules in all packages"
	@echo "============================="
	npm install --prefix server

	@echo -e "\n\n\n============================="
	@echo "Copy backend to temp folder to start build"
	@echo "============================="

	npm run build --prefix server
	rm -rf server/node_modules && npm install --production --prefix server
	npm install --production --prefix server/src/lambda/layer/common/nodejs/custom_modules
	npm install --production --prefix server/src/lambda/layer/common/nodejs
	cp -r ./server/dist ./terraform/build/server
	cp -r ./server/node_modules ./terraform/build/server/node_modules
	cp -r ./server/src/lambda/layer/common/nodejs/custom_modules/node_modules ./terraform/build/server/lambda/layer/common/nodejs/custom_modules/node_modules
	cp -r ./server/src/lambda/layer/common/nodejs/node_modules ./terraform/build/server/lambda/layer/common/nodejs/node_modules
	cp -r ./server/src/db/certificates ./terraform/build/server/db/certificates
	cp -r ./server/src/lambda/layer/common/nodejs/custom_modules/certificates ./terraform/build/server/lambda/layer/common/nodejs/custom_modules/certificates

	@echo -e "\n\n\n============================="
	@echo "Optimize node modules size"
	@echo "============================="
	npx modclean -n default:safe,default:caution -er -D terraform/build/server

	curl -s https://gobinaries.com/tj/node-prune |  PREFIX=. sh
	./node-prune terraform/build/server
	rm node-prune
	
	@echo -e "\n\n\n============================="
	@echo "Build Main Server lambda"
	@echo "============================="
	cd $(REPO_LOCATION)/terraform/build/server && zip -rq $(REPO_LOCATION)/terraform/build/server.zip *

	@echo -e "\n\n\n============================="
	@echo "Copy Node Modules, Remove custom_modules symlink, Copy custom_modules aaannnd ZIP"
	@echo "============================="

	@cp -r $(REPO_LOCATION)/terraform/build/server/lambda/layer/common/nodejs/node_modules $(REPO_LOCATION)/terraform/build/server/lambda/phacToSbc
	@rm -rf $(REPO_LOCATION)/terraform/build/server/lambda/phacToSbc/node_modules/custom_modules
	@cp -r $(REPO_LOCATION)/terraform/build/server/lambda/layer/common/nodejs/custom_modules $(REPO_LOCATION)/terraform/build/server/lambda/phacToSbc/node_modules/custom_modules
	cd $(REPO_LOCATION)/terraform/build/server/lambda/phacToSbc && zip -rq $(REPO_LOCATION)/terraform/build/phacToSbc.zip *

	@cp -r $(REPO_LOCATION)/terraform/build/server/lambda/layer/common/nodejs/node_modules $(REPO_LOCATION)/terraform/build/server/lambda/etsToSbc
	@rm -rf $(REPO_LOCATION)/terraform/build/server/lambda/etsToSbc/node_modules/custom_modules
	@cp -r $(REPO_LOCATION)/terraform/build/server/lambda/layer/common/nodejs/custom_modules $(REPO_LOCATION)/terraform/build/server/lambda/etsToSbc/node_modules/custom_modules
	cd $(REPO_LOCATION)/terraform/build/server/lambda/etsToSbc && zip -rq $(REPO_LOCATION)/terraform/build/etsToSbc.zip *

	@cd $(REPO_LOCATION)/slack && zip -rq $(REPO_LOCATION)/slack/slack.zip *
	@cp -r $(REPO_LOCATION)/slack/slack.zip $(REPO_LOCATION)/terraform/build/slack.zip

# ============================================================= #
# Local Development 
# ============================================================= #

build-local:
	@echo "Building local app image"
	@docker-compose -f docker-compose.dev.yml build

run-local:
	@echo "Running local app container"
	@docker-compose -f docker-compose.dev.yml up

run-local-test:
	@echo "Running test in server container"
	@docker-compose -f docker-compose.dev.yml run --name ets-server-test --entrypoint "npm test" server

run-db-seed:
	@echo "Running db seed in server container"
	@docker-compose -f docker-compose.dev.yml run --name ets-server-db-seed --entrypoint "npm run db:seed" server


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
	@docker exec -it $(PROJECT_NAME)-server npm run db:seed

local-server-tests:
	@echo "Running tests in local app container"
	@docker exec -it $(PROJECT_NAME)-server npm test


mongo-tunnel:
	session-manager-plugin
	rm ssh-keypair ssh-keypair.pub || true
	ssh-keygen -t rsa -f ssh-keypair -N ''
	aws ec2-instance-connect send-ssh-public-key --instance-id $(INSTANCE_ID) --availability-zone ca-central-1b --instance-os-user ssm-user --ssh-public-key file://ssh-keypair.pub
	ssh -i ssh-keypair ssm-user@$(INSTANCE_ID) -L 27017:$(REMOTE_DB_HOST):27017 -o ProxyCommand="aws ssm start-session --target %h --document-name AWS-StartSSHSession --parameters 'portNumber=%p'"

# Deploy with tags

tag-dev:
ifdef message
	@git tag -fa dev -m "Deploy $(message) to DEV env"
else
	@echo -e '\nNo message found! - Example :: make tag-dev message=abcdefg \n'
	@echo -e '------------------------------------------------ \n'
	@echo -e 'Deploying with branch name \n'
	@echo -e '------------------------------------------------ \n\n'

	@git tag -fa dev -m "Deploy $(git rev-parse --abbrev-ref HEAD) to DEV env"
endif
	@git push --force origin refs/tags/dev:refs/tags/dev

tag-test:
ifdef message
	@git tag -fa test -m "Deploy $(message) to TEST env"
else
	@echo -e '\nNo message found! - Example :: make tag-test message=abcdefg \n'
	@echo -e '------------------------------------------------ \n'
	@echo -e 'Deploying with branch name \n'
	@echo -e '------------------------------------------------ \n\n'

	@git tag -fa test -m "Deploy $(git rev-parse --abbrev-ref HEAD) to TEST env"
endif
	@git push --force origin refs/tags/test:refs/tags/test


tag-prod:
ifdef message
	@git tag -fa prod -m "Deploy $(message) to PROD env"
else
	@echo -e '\nNo message found! - Example :: make tag-prod message=abcdefg \n'
	@echo -e '------------------------------------------------ \n'
	@echo -e 'Deploying with branch name \n'
	@echo -e '------------------------------------------------ \n\n'

	@git tag -fa prod -m "Deploy $(git rev-parse --abbrev-ref HEAD) to PROD env"
endif
	@git push --force origin refs/tags/prod:refs/tags/prod
