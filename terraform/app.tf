
resource "aws_s3_bucket" "app" {
  bucket = local.app_name
  acl    = "private"
}

locals {
  s3_origin_id  = "app"
  api_origin_id = "api"
}

data "aws_cloudfront_cache_policy" "optimized" {
  name = "Managed-CachingOptimized"
}

data "aws_cloudfront_cache_policy" "disabled" {
  name = "Managed-CachingDisabled"
}

resource "aws_cloudfront_origin_access_identity" "app" {
  comment = local.app_name
}

resource "aws_cloudfront_distribution" "app" {
  comment = local.app_name
  aliases = var.target_env == "prod" ? ["travelscreening.gov.bc.ca"] : []
  origin {
    domain_name = aws_s3_bucket.app.bucket_regional_domain_name
    origin_id   = local.s3_origin_id

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.app.cloudfront_access_identity_path
    }
  }

  origin {
    domain_name = trimsuffix(trimprefix(aws_apigatewayv2_stage.api.invoke_url, "https://"), "/")
    origin_id   = local.api_origin_id

    custom_origin_config {
      http_port  = 80
      https_port = 443

      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  dynamic "viewer_certificate" {
    for_each = local.is_prod
    content {
      acm_certificate_arn      = data.aws_acm_certificate.ets[0].arn
      ssl_support_method       = "sni-only"
      minimum_protocol_version = "TLSv1.2_2019"
    }
  }


  # Non prod has no dedicated url
  dynamic "viewer_certificate" {
    for_each = local.is_not_prod
    content {
      cloudfront_default_certificate = true
    }
  }

  # We only need the US/Canada
  price_class = "PriceClass_100"

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD", "OPTIONS"]
    target_origin_id       = local.s3_origin_id
    cache_policy_id        = data.aws_cloudfront_cache_policy.optimized.id
    viewer_protocol_policy = "redirect-to-https"
    lambda_function_association {
      event_type = "origin-response"
      lambda_arn = "${aws_lambda_function.cf_origin_response.arn}:${aws_lambda_function.cf_origin_response.version}"
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/api/*"
    allowed_methods        = ["GET", "HEAD", "OPTIONS", "POST", "PUT", "PATCH", "DELETE"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = local.api_origin_id
    cache_policy_id        = data.aws_cloudfront_cache_policy.disabled.id
    viewer_protocol_policy = "redirect-to-https"
  }

  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
}

resource "aws_s3_bucket_policy" "app" {
  bucket = aws_s3_bucket.app.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.app.arn}/*"
        Principal = {
          AWS = aws_cloudfront_origin_access_identity.app.iam_arn
        }
      },
      {
        Effect   = "Allow"
        Action   = "s3:ListBucket"
        Resource = aws_s3_bucket.app.arn
        Principal = {
          AWS = aws_cloudfront_origin_access_identity.app.iam_arn
        }
      }
    ]
  })
}

output "public_url" {
  value = aws_cloudfront_distribution.app.domain_name
}

output "distribution_id" {
  value = aws_cloudfront_distribution.app.id
}

data "archive_file" "cf_origin_response" {
  type        = "zip"
  source_file = "cforigin/index.js"
  output_path = "cf_origin_response.zip"
}

resource "aws_lambda_function" "cf_origin_response" {
  provider         = aws.us-east-1
  filename         = "cf_origin_response.zip"
  function_name    = "${local.namespace}-cf-origin-response"
  handler          = "index.handler"
  runtime          = "nodejs12.x"
  timeout          = "6"
  role             = aws_iam_role.lambda.arn
  source_code_hash = data.archive_file.cf_origin_response.output_base64sha256
  # Publish true is required to version the lambda - If not provided will result in $LATEST being appended as the version in the ARN
  publish = true
}

# Allow Lambda@Edge to invoke this Lambda function
resource "aws_lambda_permission" "lambda_at_edge_cf_origin_response" {
  provider      = aws.us-east-1 # Lambda@Edge functions must be in same region as CloudFront
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.cf_origin_response.arn
  principal     = "apigateway.amazonaws.com"
}
