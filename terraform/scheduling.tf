resource "aws_cloudwatch_event_rule" "every_day_morning_sbc" {
  name                = "every-day-morning"
  description         = "Fires every day at 8:45"
  schedule_expression = "cron(45 8 * * ? *)"
}
resource "aws_cloudwatch_event_target" "call_etsToSbc_every_day_morning" {
  rule = aws_cloudwatch_event_rule.every_day_morning_sbc.name
  arn  = aws_lambda_function.etsToSbc.arn
}


resource "aws_lambda_permission" "allow_cloudwatch_to_call_etsToSbc_morning" {
  statement_id  = "AllowExecutionFromCloudWatch_Morning"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.etsToSbc.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.every_day_morning_sbc.arn
}


resource "aws_cloudwatch_event_rule" "every_day_midnight_sbc" {
  name                = "every-day-midnight"
  description         = "Fires every day at midnight"
  schedule_expression = "cron(0 0 * * ? *)"
}


resource "aws_cloudwatch_event_target" "call_etsToSbc_every_day_midnight" {
  rule = aws_cloudwatch_event_rule.every_day_midnight_sbc.name
  arn  = aws_lambda_function.etsToSbc.arn
}

resource "aws_lambda_permission" "allow_cloudwatch_to_call_etsToSbc_midnight" {
  statement_id  = "AllowExecutionFromCloudWatch_Midnight"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.etsToSbc.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.every_day_midnight_sbc.arn
}


resource "aws_cloudwatch_event_rule" "every_day_morning_phac" {
  name                = "every-day-morning"
  description         = "Fires every day at 8:45"
  schedule_expression = "cron(45 8 * * ? *)"
}

resource "aws_cloudwatch_event_target" "call_phacToSbc_every_day_morning" {
  rule = aws_cloudwatch_event_rule.every_day_morning_phac.name
  arn  = aws_lambda_function.phacToSbc.arn
}


resource "aws_lambda_permission" "allow_cloudwatch_to_call_phacToSbc_morning" {
  statement_id  = "AllowExecutionFromCloudWatch_Morning"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.phacToSbc.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.every_day_morning_phac.arn
}

resource "aws_cloudwatch_event_rule" "every_day_midnight_phac" {
  name                = "every-day-midnight"
  description         = "Fires every day at midnight"
  schedule_expression = "cron(0 0 * * ? *)"
}

resource "aws_cloudwatch_event_target" "call_phacToSbc_every_day_midnight" {
  rule = aws_cloudwatch_event_rule.every_day_midnight_phac.name
  arn  = aws_lambda_function.phacToSbc.arn
}

resource "aws_lambda_permission" "allow_cloudwatch_to_call_phacToSbc_midnight" {
  statement_id  = "AllowExecutionFromCloudWatch_Midnight"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.phacToSbc.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.every_day_midnight_phac.arn
}
