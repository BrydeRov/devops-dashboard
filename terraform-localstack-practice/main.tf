provider "aws" {
    region = "us-east-1"
    access_key = "test"
    secret_key = "test"
    skip_credentials_validation = true
    skip_requesting_account_id = true
    skip_metadata_api_check = true
    s3_use_path_style = true

    endpoints {
        s3 = "http://localhost.localstack.cloud:4566"
    }
}

resource "aws_s3_bucket" "practice_bucket" {
    bucket = "javier-practice-bucket"
}

output "bucket_name" {
    value = aws_s3_bucket.practice_bucket.id
}
