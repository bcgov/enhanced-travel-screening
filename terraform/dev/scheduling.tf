resource "aws_cloudwatch_event_rule" "every_day_morning" {
  name                = "every-day-morning"
  description         = "Fires every day at 8:45"
  schedule_expression = "cron(45 8 * * *)"
}

resource "aws_cloudwatch_event_target" "call_phacToSbc_every_day_morning" {
  rule      = aws_cloudwatch_event_rule.every_day_morning.name
  target_id = "lambda"
  arn       = aws_lambda_function.phacToSbc.arn
}

resource "aws_cloudwatch_event_target" "call_etsToSbc_every_day_morning" {
  rule      = aws_cloudwatch_event_rule.every_day_morning.name
  target_id = "lambda"
  arn       = aws_lambda_function.etsToSbc.arn
}

resource "aws_cloudwatch_event_rule" "every_day_midnight" {
  name                = "every-day-midnight"
  description         = "Fires every day at midnight"
  schedule_expression = "cron(0 0 * * *)"
}

resource "aws_cloudwatch_event_target" "call_phacToSbc_every_day_midnight" {
  rule      = aws_cloudwatch_event_rule.every_day_midnight.name
  target_id = "lambda"
  arn       = aws_lambda_function.phacToSbc.arn
}

resource "aws_cloudwatch_event_target" "call_etsToSbc_every_day_midnight" {
  rule      = aws_cloudwatch_event_rule.every_day_midnight.name
  target_id = "lambda"
  arn       = aws_lambda_function.etsToSbc.arn
}
