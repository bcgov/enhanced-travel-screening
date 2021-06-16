data "aws_ssm_parameter" "database_password" {
  name = "/${var.target_env}/database/password"
}

data "aws_ssm_parameter" "sbc_cli_secret" {
  name = "/${var.target_env}/sbc/cli/secret"
}

data "aws_ssm_parameter" "sbc_password" {
  name = "/${var.target_env}/sbc/password"
}

data "aws_ssm_parameter" "jwt_secret" {
  name = "/${var.target_env}/jwt/secret"
}

data "aws_ssm_parameter" "password_salt" {
  name = "/${var.target_env}/password/salt"
}

data "aws_ssm_parameter" "slack_endpoint" {
  name = "/${var.target_env}/slack/endpoint"
}
