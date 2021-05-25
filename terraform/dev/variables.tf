variable "target_env" {}
variable "project_code" {}
variable "git_version" {}
variable "project_name" {}

variable "target_aws_account_id" {}
data "aws_caller_identity" "current" {}


variable "api_zip" {}
variable "ets_to_sbc_zip" {}
variable "phac_to_sbc_zip" {}

variable "azs" {
  default = ["ca-central-1a", "ca-central-1b"]
}

variable "region" {
  default = "ca-central-1"
}

locals {
  namespace  = var.project_code
  account_id = data.aws_caller_identity.current.account_id
  app_name   = "${var.project_name}-${var.target_env}-app"
  api_name = "${var.project_name}-${var.target_env}-server"
  ets_to_sbc = "${var.project_name}-${var.target_env}-ets-sbc"
  phac_to_sbc = "${var.project_name}-${var.target_env}-phac-sbc"
}