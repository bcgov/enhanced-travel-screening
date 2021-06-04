
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
    # lambda_function_association {
    #   event_type = "origin-response"
    #   lambda_arn = "${aws_lambda_function.cf_origin_response.arn}:${aws_lambda_function.cf_origin_response.version}"
    # }
  }

  ordered_cache_behavior {
    path_pattern           = "/api/*"
    allowed_methods        = ["GET", "HEAD", "OPTIONS", "POST", "PUT", "PATCH", "DELETE"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = local.api_origin_id
    cache_policy_id        = data.aws_cloudfront_cache_policy.disabled.id
    viewer_protocol_policy = "redirect-to-https"
  }

  viewer_certificate {
    cloudfront_default_certificate = true
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

# to be removed after service account creation and pipeline setup. 
resource "null_resource" "update_cf_app" {
  provisioner "local-exec" {
    command = <<EOF
      aws_credentials=$( aws sts assume-role --role-arn arn:aws:iam::${local.account_id}:role/BCGOV_${var.target_env}_Automation_Admin_Role --role-session-name tf-provisioner) &&
      export AWS_ACCESS_KEY_ID=$(echo $aws_credentials|jq '.Credentials.AccessKeyId'|tr -d '"') &&
      export AWS_SECRET_ACCESS_KEY=$(echo $aws_credentials|jq '.Credentials.SecretAccessKey'|tr -d '"') &&
      export AWS_SESSION_TOKEN=$(echo $aws_credentials|jq '.Credentials.SessionToken'|tr -d '"') &&
      aws s3 sync ./build/client/ s3://${aws_s3_bucket.app.bucket} --delete && 
      aws --region ca-central-1 cloudfront create-invalidation --distribution-id "${aws_cloudfront_distribution.app.id}"  --paths "/*"
    EOF
  }

  triggers = {
    git_build_version = var.git_version
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
