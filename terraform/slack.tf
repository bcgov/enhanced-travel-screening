resource "aws_lambda_function" "slack" {
  description      = "slack alert function ${local.namespace}"
  function_name    = local.slack
  role             = aws_iam_role.lambda.arn
  runtime          = "nodejs14.x"
  filename         = "slack/slack.zip"
  source_code_hash = filebase64sha256("slack/slack.zip")
  handler          = "index.handler"
  memory_size      = 512
  timeout          = 10

  vpc_config {
    security_group_ids = [aws_security_group.lambda_access.id]
    subnet_ids         = module.network.aws_subnet_ids.app.ids
  }
  environment {
    variables = {
      NODE_ENV       = var.target_env
      SLACK_ENDPOINT = data.aws_ssm_parameter.slack_endpoint.value
    }
  }
}

resource "aws_sns_topic" "aws_alerts" {
  name = "${var.target_env}-aws-alerts"
}

resource "aws_sns_topic_subscription" "user_updates_sqs_target" {
  topic_arn = aws_sns_topic.aws_alerts.arn
  protocol  = "lambda"
  endpoint  = aws_lambda_function.slack.arn
}

resource "aws_lambda_permission" "user_updates_sqs_target" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.slack.function_name
  principal     = "sns.amazonaws.com"
  source_arn    = aws_sns_topic.aws_alerts.arn
}