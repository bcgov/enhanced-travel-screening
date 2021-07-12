# resource "aws_cloudwatch_event_rule" "ets_to_sbc" {
#   name                = "every-day-ets-to-sbc"
#   description         = "Fires every day at 8:15 AM PDT"
#   schedule_expression = "cron(0 07 * * ? *)"
# }
# resource "aws_cloudwatch_event_target" "ets_to_sbc" {
#   rule = aws_cloudwatch_event_rule.ets_to_sbc.name
#   arn  = aws_lambda_function.etsToSbc.arn
# }


# resource "aws_lambda_permission" "ets_to_sbc" {
#   statement_id  = "AllowExecutionFromCloudWatch_Morning"
#   action        = "lambda:InvokeFunction"
#   function_name = aws_lambda_function.etsToSbc.function_name
#   principal     = "events.amazonaws.com"
#   source_arn    = aws_cloudwatch_event_rule.ets_to_sbc.arn
# }

resource "aws_cloudwatch_event_rule" "phac_to_sbc" {
  name                = "every-day-phac-to-sbc"
  description         = "Fires every day 0.00 PDT"
  schedule_expression = "cron(15 15 * * ? *)"
}

resource "aws_cloudwatch_event_target" "phac_to_sbc" {
  rule = aws_cloudwatch_event_rule.phac_to_sbc.name
  arn  = aws_lambda_function.phacToSbc.arn
}


resource "aws_lambda_permission" "phac_to_sbc" {
  statement_id  = "AllowExecutionFromCloudWatch_Morning"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.phacToSbc.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.phac_to_sbc.arn
}