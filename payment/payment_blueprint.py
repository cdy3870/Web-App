import os
import stripe

from flask import Flask, jsonify, render_template, request, Blueprint
import items.manage

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


@payment_bp.route("/create-checkout-session/<itemid>/<kind>/<price>")
def create_checkout_session(itemid, kind, price):
    # For testing purposes
    domain_url = "https://5000-cs-617535499474-default.us-east1.cloudshell.dev/"
    stripe.api_key = stripe_keys["secret_key"]
    item = items.manage.get_list_item(itemid, kind)
    item = item.to_dict()
    print(type(price))
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
            success_url = domain_url + "success?session_id={CHECKOUT_SESSION_ID}",
            cancel_url = domain_url + "rent",
            payment_method_types = ["card"],
            mode = "payment",
            line_items=[
                {
                    "name": item['title'],
                    "quantity": 1,
                    "currency": "usd",
                    "amount": int(price) * 100
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

@payment_bp.route('/customer-portal', methods=['POST'])
def customer_portal():
    data = json.loads(request.data)
    # For demonstration purposes, we're using the Checkout session to retrieve the customer ID.
    # Typically this is stored alongside the authenticated user in your database.
    checkout_session_id = data['sessionId']
    checkout_session = stripe.checkout.Session.retrieve(checkout_session_id)

    # This is the URL to which the customer will be redirected after they are
    # done managing their billing with the portal.
    return_url = os.getenv("DOMAIN")

    session = stripe.billing_portal.Session.create(
        customer=checkout_session.customer,
        return_url=return_url)
    return jsonify({'url': session.url})