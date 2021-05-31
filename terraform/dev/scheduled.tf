resource "aws_lambda_function" "etsToSbc" {
  description      = "etsToSbc function ${local.namespace}"
  function_name    = local.ets_to_sbc
  role             = aws_iam_role.lambda.arn
  runtime          = "nodejs14.x"
  filename         = var.ets_to_sbc_zip
  source_code_hash = filebase64sha256(var.ets_to_sbc_zip)
  handler          = "index.handler"
  memory_size      = 1024
  timeout          = 10

  environment {
    variables = {
      SBC_USER                  = var.sbc_user
      SBC_PW                    = var.sbc_pw
      SBC_CLI_SECRET            = var.sbc_cli_secret
      SLACK_ENDPOINT            = var.slack_endpoint
      DB_SERVER                 = var.db_server
      DB_PORT                   = var.db_port
      DB_USER                   = var.db_user
      DB_PASSWORD               = var.db_password
      DB_NAME                   = var.db_name
      VERSION                   = var.git_version
      DB_WRITE_SERVICE_DISABLED = var.db_write_service_disabled
    }
  }
}

resource "aws_lambda_permission" "allow_cloudwatch_to_call_etsToSbc" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.etsToSbc.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.every_day.arn
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
  timeout          = 10

  environment {
    variables = {
      SBC_USER                  = var.sbc_user
      SBC_PW                    = var.sbc_pw
      SBC_CLI_SECRET            = var.sbc_cli_secret
      SLACK_ENDPOINT            = var.slack_endpoint
      DB_SERVER                 = var.db_server
      DB_PORT                   = var.db_port
      DB_USER                   = var.db_user
      DB_PASSWORD               = var.db_password
      DB_NAME                   = var.db_name
      VERSION                   = var.git_version
      DB_WRITE_SERVICE_DISABLED = var.db_write_service_disabled
    }
  }
}

resource "aws_lambda_permission" "allow_cloudwatch_to_call_phacToSbc" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.phacToSbc.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.every_day.arn
}

resource "aws_cloudwatch_event_target" "call_etsToSbc_every_day" {
  rule      = aws_cloudwatch_event_rule.every_day.name
  target_id = "lambda"
  arn       = aws_lambda_function.etsToSbc.arn
}

resource "aws_cloudwatch_event_target" "call_phacToSbc_every_day" {
  rule      = aws_cloudwatch_event_rule.every_day.name
  target_id = "lambda"
  arn       = aws_lambda_function.phacToSbc.arn
}

resource "aws_cloudwatch_event_rule" "every_day" {
  name                = "every-day"
  description         = "Fires every day"
  schedule_expression = "rate(1 day)"
}
