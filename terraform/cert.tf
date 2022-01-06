
# For DEV and STAGING
# Certificate request DNS validation is done in AWS of freshworks.club

resource "aws_acm_certificate" "fw_ets" {

  count = local.fw_club

  provider = aws.us-east-1

  domain_name       = "${var.target_env}.ets.freshworks.club"
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}
