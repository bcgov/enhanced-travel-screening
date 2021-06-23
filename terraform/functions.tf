resource "aws_lambda_function" "etsToSbc" {
  description      = "etsToSbc function ${local.namespace}"
  function_name    = local.ets_to_sbc
  role             = aws_iam_role.lambda.arn
  runtime          = "nodejs14.x"
  filename         = var.ets_to_sbc_zip
  source_code_hash = filebase64sha256(var.ets_to_sbc_zip)
  handler          = "index.handler"
  memory_size      = 1024
  timeout          = 300

  vpc_config {
    security_group_ids = [aws_security_group.lambda_access.id]
    subnet_ids         = module.network.aws_subnet_ids.app.ids
  }
  environment {
    variables = {
      NODE_ENV = var.target_env
      VERSION  = var.git_version

      DB_SERVER = aws_docdb_cluster.db_cluster.endpoint

      SBC_USER                  = "phoct"
      DB_PORT                   = "27017"
      DB_USER                   = "root"
      DB_NAME                   = "ets-${var.target_env}"
      DB_WRITE_SERVICE_DISABLED = "false"

      DB_PASSWORD    = data.aws_ssm_parameter.database_password.value
      SBC_CLI_SECRET = data.aws_ssm_parameter.sbc_cli_secret.value
      SBC_PW         = data.aws_ssm_parameter.sbc_password.value
      SLACK_ENDPOINT = data.aws_ssm_parameter.slack_endpoint.value
    }
  }
}

resource "aws_lambda_permission" "allow_cloudwatch_to_call_etsToSbc_morning" {
  statement_id  = "AllowExecutionFromCloudWatch_Morning"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.etsToSbc.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.every_day_morning.arn
}

resource "aws_lambda_permission" "allow_cloudwatch_to_call_etsToSbc_midnight" {
  statement_id  = "AllowExecutionFromCloudWatch_Midnight"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.etsToSbc.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.every_day_midnight.arn
}

resource "aws_lambda_function" "phacToSbc" {
  description      = "phacToSbc function ${local.namespace}"
  function_name    = local.phac_to_sbc
  role             = aws_iam_role.lambda.arn
  runtime          = "nodejs14.x"
  filename         = var.phac_to_sbc_zip
  source_code_hash = filebase64sha256(var.phac_to_sbc_zip)
  handler          = "index.handler"
  memory_size      = 1024
  timeout          = 300

  vpc_config {
    security_group_ids = [aws_security_group.lambda_access.id]
    subnet_ids         = module.network.aws_subnet_ids.app.ids
  }
  environment {
    variables = {
      NODE_ENV = var.target_env
      VERSION  = var.git_version

      DB_SERVER = aws_docdb_cluster.db_cluster.endpoint

      SBC_USER                  = "phoct"
      DB_PORT                   = "27017"
      DB_USER                   = "root"
      DB_NAME                   = "ets-${var.target_env}"
      DB_WRITE_SERVICE_DISABLED = "false"

      DB_PASSWORD    = data.aws_ssm_parameter.database_password.value
      SBC_CLI_SECRET = data.aws_ssm_parameter.sbc_cli_secret.value
      SBC_PW         = data.aws_ssm_parameter.sbc_password.value
      SLACK_ENDPOINT = data.aws_ssm_parameter.slack_endpoint.value
    }
  }
}

resource "aws_lambda_permission" "allow_cloudwatch_to_call_phacToSbc_morning" {
  statement_id  = "AllowExecutionFromCloudWatch_Morning"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.phacToSbc.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.every_day_morning.arn
}

resource "aws_lambda_permission" "allow_cloudwatch_to_call_phacToSbc_midnight" {
  statement_id  = "AllowExecutionFromCloudWatch_Midnight"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.phacToSbc.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.every_day_midnight.arn
}
