resource "aws_route53_zone" "ets" {
  count = var.target_env == "prod" ? 1 : 0
  name  = "travelscreening.gov.bc.ca"
}

data "aws_acm_certificate" "ets" {
  count    = var.target_env == "prod" ? 1 : 0
  domain   = "travelscreening.gov.bc.ca"
  statuses = ["ISSUED"]
  provider = aws.us-east-1
}

resource "aws_route53_record" "www" {
  count   = var.target_env == "prod" ? 1 : 0
  zone_id = aws_route53_zone.ets[0].zone_id
  name    = "travelscreening.gov.bc.ca"
  type    = "A"
  ttl     = "300"
  alias {
    name                   = aws_cloudfront_distribution.app.domain_name
    zone_id                = aws_cloudfront_distribution.app.hosted_zone_id
    evaluate_target_health = false
  }
}
