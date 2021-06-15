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
      SBC_USER                  = "phoct"
      SBC_PW                    = "yIL5432*971K" # ssm
      SBC_CLI_SECRET            = "831d77fa-64dc-4f80-8eb8-960a2220aa59" # ssm
      SLACK_ENDPOINT            = "https://hooks.slack.com/services/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"

      DB_SERVER                 = aws_docdb_cluster.db_cluster.endpoint
      DB_PORT                   = "27017"
      DB_USER                   = "root"
      DB_PASSWORD               = data.aws_ssm_parameter.database_password.value
      DB_NAME                   = "ets-${var.target_env}"
      VERSION                   = var.git_version
      DB_WRITE_SERVICE_DISABLED = "false"
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
  timeout          = 10

  environment {
    variables = {
      SBC_USER                  = "phoct"
      SBC_PW                    = "yIL5432*971K" # ssm
      SBC_CLI_SECRET            = "831d77fa-64dc-4f80-8eb8-960a2220aa59" # ssm
      SLACK_ENDPOINT            = "https://hooks.slack.com/services/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"

      DB_SERVER                 = aws_docdb_cluster.db_cluster.endpoint
      DB_PORT                   = "27017"
      DB_USER                   = "root"
      DB_PASSWORD               = data.aws_ssm_parameter.database_password.value
      DB_NAME                   = "ets-${var.target_env}"
      VERSION                   = var.git_version
      DB_WRITE_SERVICE_DISABLED = "false"
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
