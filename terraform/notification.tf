resource "aws_sns_topic" "aws_alerts" {
  name = "${var.target_env}-aws-alerts"
}