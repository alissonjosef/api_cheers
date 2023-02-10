module.exports = app => {  

    const saveMensagem = (req, res) => {      
        console.log('aqui')
        app.db('contact')
        .insert({ 
            name:req.body.name,
            email:req.body.email,
            message:req.body.mensagem, 
            parceiroId:req.user.id
        })
        .then(_ => res.status(200).send())
        .catch(err => res.status(400).json(err))
    }

    return {saveMensagem}
}