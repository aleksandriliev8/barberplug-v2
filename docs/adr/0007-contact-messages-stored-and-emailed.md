# Contact Messages are stored and emailed

A Contact Message is saved in Postgres first and then emailed to the shop through SES, so a failed email never loses a message. v1 has no inbox page in the admin area; the email is the way the Owner reads them. Spam is limited with a honeypot field and a per-IP rate limit; a CAPTCHA was rejected for v1 because it adds friction and a third-party script.
