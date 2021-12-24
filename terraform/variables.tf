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
  namespace   = var.project_code
  account_id  = data.aws_caller_identity.current.account_id
  app_name    = "${var.project_name}-app-${var.target_env}"
  api_name    = "${var.project_name}-server-${var.target_env}"
  ets_to_sbc  = "${var.project_name}-ets-sbc-${var.target_env}"
  phac_to_sbc = "${var.project_name}-phac-sbc-${var.target_env}"
  slack = "${var.project_name}-slack-${var.target_env}"
  is_prod     = var.target_env == "prod" ? [var.target_env] : []
  is_not_prod     = var.target_env != "prod" ? [var.target_env] : []
}
