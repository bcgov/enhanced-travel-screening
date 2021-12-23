module "notify_slack" {
  source  = "terraform-aws-modules/notify-slack/aws"
  version = "~> 4.0"

  sns_topic_name = "${var.target_env}_slack_alerts"

  slack_webhook_url = data.aws_ssm_parameter.slack_endpoint.value
  slack_channel     = "health-pod-covid-response"
  slack_username    = "aws-reporter"
}