resource "aws_route53_zone" "ets" {
  name = "travelscreening.gov.bc.ca"
}

data "aws_acm_certificate" "ets" {
  domain   = "travelscreening.gov.bc.ca"
  statuses = ["ISSUED"]
  provider = aws.us-east-1
}

resource "aws_route53_record" "www" {
  zone_id = aws_route53_zone.ets.zone_id
  name    = "travelscreening.gov.bc.ca"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.app.domain_name
    zone_id                = aws_cloudfront_distribution.app.hosted_zone_id
    evaluate_target_health = false
  }
}