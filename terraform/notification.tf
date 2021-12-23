module "notify_slack" {
  source  = "terraform-aws-modules/notify-slack/aws"
  version = "~> 4.0"

  sns_topic_name = "${var.target_env}_slack_alerts"

  slack_webhook_url = "https://hooks.slack.com/services/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"
  slack_channel     = "health-pod-covid-response"
  slack_username    = "aws-reporter"
}