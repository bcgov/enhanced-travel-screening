
resource "aws_cloudwatch_log_metric_filter" "api_server_lambda_errors" {
  name           = "ets_api_server_lambda_errors_filter"
  pattern        = "?ERROR ?WARN"
  log_group_name = "/aws/lambda/ets-server-${var.target_env}"

  metric_transformation {
    name      = "api_server_lambda_unexpected_errors"
    namespace = "lambda_alarms"
    value     = "1"
  }
}

resource "aws_cloudwatch_metric_alarm" "api_server_lambda_errors" {
  alarm_name          = "api_server_lambda_errors"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "1"
  metric_name         = "api_server_lambda_unexpected_errors"
  namespace           = "lambda_alarms"
  period              = "30"
  threshold           = "1"
  statistic           = "Average"
  alarm_description   = "This metric monitors server lambda alerts"
  alarm_actions       = [aws_sns_topic.aws_alerts.arn]
  ok_actions          = [aws_sns_topic.aws_alerts.arn]

  insufficient_data_actions = []
}

resource "aws_cloudwatch_log_metric_filter" "api_server_levels" {
  name           = "ets_api_server_levels_filter"
  pattern        = "{ $.level = \"error\" }"
  log_group_name = "/aws/lambda/ets-server-${var.target_env}"

  metric_transformation {
    name      = "api_server_error_log"
    namespace = "lambda_alarms"
    value     = "1"
  }
}

resource "aws_cloudwatch_metric_alarm" "api_server_levels" {
  alarm_name          = "api_server_levels"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "1"
  metric_name         = "api_server_error_log"
  namespace           = "lambda_alarms"
  period              = "30"
  threshold           = "1"
  statistic           = "Average"
  alarm_description   = "This metric monitors server lambda alerts"
  alarm_actions       = [aws_sns_topic.aws_alerts.arn]
  ok_actions          = [aws_sns_topic.aws_alerts.arn]

  insufficient_data_actions = []
}
