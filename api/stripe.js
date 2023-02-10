
const secretKey = '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'
const publicKey = 'pk_live_51KscDwADzTo8cR2YFgptZvlfrryuBOFfIlUFe6Kpsb4JGwOlTkIK54iLG1DwAc6Jm05WE8pY2BsPdZWPVXQq4BWG00iSIAoWcF'

const stripe = require('stripe')(secretKey)


const endpointSecret = "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";


module.exports = app => {
    function paymentWebhook(req,res) {
        const subscriptionObject = {
            updated_at: new Date
        }
        let event = req.body;

        let subscription,invoice,charge,session;
        switch (event.type) {
            case 'customer.subscription.created':
                    subscription = event.data.object;
                    handleSubscription(subscription);
                    console.log(`Event type ${event.type}.`);
                break;

            case 'customer.subscription.updated':
                    subscription = event.data.object;
                    handleSubscription(subscription);
                    console.log(`Event type ${event.type}.`);
                break;

            case 'customer.subscription.deleted':
                    subscription = event.data.object;
                    handleSubscription(subscription);
                    console.log(`Event type ${event.type}.`);
                break;

            case 'invoice.payment_succeeded':
                    invoice = event.data.object;
                    handleInvoice(invoice)
                    console.log(`Event type ${event.type}.`);
                break;
            
            case 'invoice.paid':
                    invoice = event.data.object;
                    handleInvoice(invoice)
                    console.log(`Event type ${event.type}.`);
                break;

            case 'charge.dispute.funds_withdrawn':
                    charge = event.data.object;
                    handleDispute(charge)
                    console.log(`Event type ${event.type}.`);
                break;

            case 'checkout.session.completed':
                    session = event.data.object
                    handleSession(session)
                    console.log(`Event type ${event.type}.`);
                break;

            default:
              // Unexpected event type
              console.log(`Unhandled event type ${event.type}.`);
          }
          // Return a 200 response to acknowledge receipt of the event
          res.send();



            function handleSubscription(sub,type){
                const {
                    id,
                    current_period_end,
                    current_period_start,
                    customer,
                    plan,
                    status,
                    cancel_at_period_end,
                } = sub
                const {
                    amount,
                } = plan
                const planId = plan.id
            
                subscriptionObject.id = customer
                subscriptionObject.sub_id = id
                subscriptionObject.plan_id = planId
                subscriptionObject.started_at = current_period_start
                subscriptionObject.end_at = current_period_end
                subscriptionObject.total = amount
                subscriptionObject.status = cancel_at_period_end ? 'canceled' : status
                subscriptionObject.subscription_status = cancel_at_period_end ? 'canceled' : status
                insertOrUpdate(subscriptionObject)
            }
            
            function handleInvoice(invoice,type){
                const {
                    customer,
                    customer_email,
                    invoice_pdf,
                    total,
                    status,
                    payment_intent,
                } = invoice
                subscriptionObject.id = customer
                subscriptionObject.payment_intent = payment_intent
                subscriptionObject.payment_status = status
                subscriptionObject.total = total
                subscriptionObject.customer_email = customer_email
                subscriptionObject.invoice_pdf = invoice_pdf
                insertOrUpdate(subscriptionObject)
            }
        
            function handleDispute(charge,type){
                const {
                    id,
                    created,
                    currency,
                    evidence,
                    amount,
                    reason,
                    status,
                    customer,
                    payment_intent,
                } = charge

                const {
                    customer_email_address
                } = evidence
                console.log("DISPUTED,",{
                    id,
                    created,
                    currency,
                    //evidence,
                    amount,
                    reason,
                    status,
                })
                
                subscriptionObject.id = customer
                subscriptionObject.payment_intent = payment_intent
                subscriptionObject.customer_email = customer_email_address
                subscriptionObject.status = status
                subscriptionObject.has_disputed = "S"
                subscriptionObject.disputed_reason = reason
                subscriptionObject.disputed_status = status

                updateByPaymentIntention(subscriptionObject)
            }

            function handleSession(session,type){
                const {
                    client_reference_id,
                    customer_details,
                    customer,
                } = session
                const {
                    email,
                } = customer_details
                
                subscriptionObject.id = customer
                subscriptionObject.user_id = client_reference_id
                subscriptionObject.customer_email = email
                insertOrUpdate(subscriptionObject)
            }
    }
    
    function cancelSubscription(req,res){
        const {
            user_id
        } = req.body

        if(!user_id)
            return res.status(400).json({
                success: false,
                errorMsg: 'user_id empty'
            })
        

        return app.db('subscriptions')
            .where({user_id,status:'active'})
            .then(result => {
                if(result.length == 0)
                    return res.status(404).json({
                        success:false,
                        user_id,
                        errorMsg: `subscription with user_id not found`
                    })
                    result.map(sub => {
                        if(sub.sub_id !=null && sub.status != 'canceled')
                            return stripe.subscriptions.update(sub.sub_id,{
                                        cancel_at_period_end:true
                                    }).then(strip_res => {
                                        let tempSub = sub
                                        tempSub.subscription_status = 'canceled'
                                        tempSub.status = 'canceled'
                                        tempSub.updated_at = new Date
                                        tempSub.end_at = 0
                                        insertOrUpdate(tempSub)
                                                .then(dbOk => {
                                                    if(dbOk)
                                                        return res.json({
                                                            success: true,
                                                            userInfo: {
                                                                subscription: tempSub
                                                            }
                                                        })
                                                    return res.status(400).json({
                                                        success: false,
                                                        errorMsg: 'failed to insert cancelled subscription',
                                                        userInfo: {
                                                            subscription: sub
                                                        }
                                                    })
                                                })
                                    })
                        return res.status(400).json({
                            success: false,
                            errorMsg: 'this subscription has been canceled',
                            userInfo:{
                                subscription: sub
                            }
                        })
                    })
                
            })


    }

    function getSubscription(user_id){
        return app.db('subscriptions')
                    .where({user_id})
    }

    return { paymentWebhook , cancelSubscription , getSubscription}


    
    

    function insertOrUpdate(sub){
        return app.db('subscriptions')
            .insert(sub)
            .onConflict('id')
            .merge()
            .then(_=>true)
            .catch(err => {
                console.log("ERROR INSERT / UPDATE : ",sub)
                console.error("ERR: ",err)
                console.log("\n\n")
            })
    }

    function updateByPaymentIntention(sub){
        return app.db('subscriptions')
            .where({payment_intent:sub.payment_intent})
            .update(sub)
            .then(_=> _.rows > 0)
            .catch(err => {
                console.log("ERROR INSERT / UPDATE : ",sub)
                console.error("ERR: ",err)
                console.log("\n\n")
            })
    }


}

