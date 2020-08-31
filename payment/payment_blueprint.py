import os
import stripe

from flask import Flask, jsonify, render_template, request, Blueprint

payment_bp = Blueprint('payment_blueprint', __name__, template_folder='templates')

stripe_keys = {
    "secret_key": "sk_test_51HLIXTDq1K2OwQRAU7ISm1a7mq2INdeWsSalanWfLvqrIC43Sq7sL6jE5MFxRst2NJo6oIB3CIyuX2d3COo0C1EE00GAkGS9fk",
    "publishable_key": "pk_test_51HLIXTDq1K2OwQRAGer8l9IDXRgAmYg8eRrB9NPgXqrVgv2nZ5HqtGx050mvJrMQzvH2QmcANlTdhvm13AvWfWxX00HnQFAcJe"
}

stripe.api_key = stripe_keys["secret_key"]


@payment_bp.route("/config")
def get_publishable_key():
    stripe_config = {"publicKey": stripe_keys["publishable_key"]}
    return jsonify(stripe_config)


@payment_bp.route("/create-checkout-session")
def create_checkout_session():
    # For testing purposes
    domain_url = "https://5000-824a9229-0f63-4adf-a13a-b1601aa981de.us-east1.cloudshell.dev/"
    stripe.api_key = stripe_keys["secret_key"]

    try:
        # Create new Checkout Session for the order
        # Other optional params include:
        # [billing_address_collection] - to display billing address details on the page
        # [customer] - if you have an existing Stripe Customer ID
        # [payment_intent_data] - lets capture the payment later
        # [customer_email] - lets you prefill the email input in the form
        # For full details see https:#stripe.com/docs/api/checkout/sessions/create

        # ?session_id={CHECKOUT_SESSION_ID} means the redirect will have the session ID set as a query param
        checkout_session = stripe.checkout.Session.create(
            success_url=domain_url + "success?session_id={CHECKOUT_SESSION_ID}",
            cancel_url=domain_url + "rent",
            payment_method_types=["card"],
            mode="payment",
            line_items=[
                {
                    "name": "T-shirt",
                    "quantity": 1,
                    "currency": "usd",
                    "amount": "2000",
                }
            ]
        )
        return jsonify({"sessionId": checkout_session["id"]})
    except Exception as e:
        return jsonify(error=str(e)), 403

@payment_bp.route("/success")
def success():
    return render_template("success.html")

@payment_bp.route("/cancelled")
def cancelled():
    return render_template("cancelled.html")


@payment_bp.route("/webhook")
def webhook():
    payload = request.get_data(as_text=True)
    sig_header = request.headers.get("Stripe-Signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, stripe_keys["endpoint_secret"]
        )

    except ValueError as e:
        # Invalid payload
        return "Invalid payload", 400
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        return "Invalid signature", 400

    # Handle the checkout.session.completed event
    if event["type"] == "checkout.session.completed":
        print("Payment was successful.")
        # TODO: run some custom code here

    return "Success", 200