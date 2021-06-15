data "aws_ssm_parameter" "database_password" {
  name = "/${var.target_env}/database/password"
}
