const bcrypt = require('bcrypt-nodejs')
const multer = require('multer');
const axios = require('axios');
const { REFUSED } = require('dns');
const jwt = require('jwt-simple')
const { authSecret } = require('../.env')

module.exports = app => {
    const obterHash = (password, callback) => {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, null, (err, hash) => callback(hash))
        })
    }

    const save = async (req, res) => {
        const {
            nome,
            email,
            password,
            nome_negocio,
            descricao_negocio,
            endereco,
            horario_funcionamento,
            telefone,
            image_bar,
            url_facebook,
            url_instagram
        } = req.body
        const hasUser = await app.db('parceiro').select('*').where({ email })
        if (hasUser.length > 0)
            return res.status(303).json({
                status: "Email in use"
            })
        obterHash(password, hash => {
            const passwordHash = hash

            app.db('parceiro')
                .insert({
                    nome,
                    email,
                    password: passwordHash,
                    nome_negocio,
                    descricao_negocio,
                    endereco,
                    horario_funcionamento,
                    telefone,
                    url_facebook,
                    url_instagram,
                })
                .then(_ => res.status(201).json({
                    status: "OK"
                }))
                .catch(err => {
                    res.status(400).json(err)
                })
        })
    }

    const getPartnerById = (req, res) => {
        let partnerId = req.user.id;

        if (partnerId == '' || partnerId == undefined) {
            return res.status(400).send('Informe Id')
        }

        app.db('parceiro')
            .select(
                'id',
                'nome_negocio',
                'descricao_negocio',
                'endereco',
                'horario_funcionamento',
                'telefone',
                'url_facebook',
                'url_instagram',
                'image_bar'
            )
            .where({ id: partnerId })
            .then(partner => res.json(partner))
            .catch(err => res.status(401).json(err));
    }

    const getPartner = (req, res) => {

        let partnerId = req.query.id;


        if (partnerId == '' || partnerId == undefined) {
            return res.status(400).send('Informe Id')
        }

        app.db('parceiro')
            .select(
                'id',
                'nome_negocio',
                'descricao_negocio',
                'endereco',
                'horario_funcionamento',
                'telefone',
                'url_facebook',
                'url_instagram',
                'image_bar'
            )
            .where({ id: partnerId })
            .then(partner => res.json(partner))
            .catch(err => res.status(401).json(err));
    }

    const getDrink = (req, res) => {

        let partnerId = req.query.id;

        if (partnerId == '' || partnerId == undefined) {
            return res.status(400).send('Informe Id')
        }

        app.db('drink')
            .select('*')
            /* .table('drink')
            .innerJoin('drink_day', 'drink.id', 'drink_day.drinkId') */
            .where({ parceiroId: partnerId })
            .orderBy('id', 'DESC')
            .then(partner => {
                console.log(partner)
                res.json(partner)
            })
            .catch(err => res.status(401).json(err))
    }

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'public/uploads/')
        },
        filename: function (req, file, cb) {
            // Extração da extensão do arquivo original:
            const extensaoArquivo = file.originalname.split('.')[1];

            // Cria um código randômico que será o nome do arquivo
            const novoNomeArquivo = require('crypto')
                .randomBytes(64)
                .toString('hex');

            // Indica o novo nome do arquivo:
            cb(null, `${novoNomeArquivo}.${extensaoArquivo}`)
        }
    });

    const upload = multer({ storage });

    const editPathner = (req, res) => {
        upload.single('foto')(req, res, err => {

            if (err) {
                res.status(500).json({ error: 1, payload: err });
            } else {
                const image = {};
                image.id = req.file?.filename;
                image.url = `/uploads/${image.id}`;

                if (image.id != undefined) {
                    req.body.image_bar = image.url;
                }
                getCoordsByAddress(req.body.endereco)
                    .then(coords => {
                        console.log(coords)
                        const partner = req.body
                        partner.lat = ''
                        partner.long = ''
                        if (coords) {
                            partner.lat = coords.lat
                            partner.long = coords.lng
                        }
                        app.db('parceiro')
                            .where({ id: req.user.id })
                            .update(partner)
                            .then(_ => res.status(204).send({ sucsses: true }))
                            .catch(err => res.status(400).json(err));
                    })

            }

        })

    }

    const getAllPathner = (req, res) => {

        const { userId } = req.query
        //req.body
        //req.header

        app.db('parceiro')
            .select('id', 'nome_negocio', 'descricao_negocio', 'endereco', 'image_bar', 'lat', 'long')
            .then(partner => res.json(partner))
            .catch(err => res.status(400).json(err))
    }

    function getFilterPartner(req, res) {

        const { namePartner } = req.query

        if (!namePartner)
            return res.status(400).json({ success: false })

        app.db('parceiro')
            .select('id', 'nome_negocio', 'descricao_negocio', 'endereco', 'image_bar')
            .whereRaw('LOWER(nome_negocio) LIKE ?', '%' + namePartner.toLowerCase() + '%')
            .then(partner => res.json(partner))
            .catch(err => res.status(400).json(err))
    }

    const deletePartner = (req, res) => {

        const { user_id } = req.body

        if (user_id != undefined) {
            app.db('parceiro')
                .where({ id: user_id })
                .del()
                .then(rowsDeleted => {
                    if (rowsDeleted > 0) {
                        res.status(204).send()
                    } else {
                        const msg = `user não encontrado ${user_id}.`
                        res.status(400).send(msg)
                    }
                })
                .catch(err => res.status(400).json(err))
        } else {
            res.status(400).send("Usúario não autorizado!")
        }

    }

    async function getCoordsByAddress(address) {
        const key = "AIzaSyDUfO7xIVnJViP4PQ--GWMVScB5R-DD2wg"
        if (!address)
            return false
        const url = `https://maps.googleapis.com/maps/api/geocode/json?key=${key}&address=${address}`
        try {
            const response = await axios.get(url);
            if (response.data.status == "OK") {
                return response.data.results[0].geometry.location
            }
        } catch (error) {
            console.error(error);
        }
        return false
    }

    function getToken(req) {
        
        const token = req.rawHeaders.find(el => el.startsWith('bearer') || el.startsWith('Bearer'))

        return token.split(" ")[1];

    }

    const getDaysBar = (req, res) => {

        const { id } = jwt.decode(getToken(req), authSecret);

        app.db('bar_day')
            .select('*')
            .where({ parceiroId: id })
            .first()
            .then(partner => {
                return res.json(partner)
            })
            .catch(err => res.status(400).json(err))

    }

    const daysBar = (req, res) => {

        const { id } = jwt.decode(getToken(req), authSecret);

        const bar_day = req.body;

        if (!bar_day) {
            console.log('400 1')
            return res.status(400).json({
                success: false,
                message: 'empty fields'
            })
        }

        if (bar_day.sunday_active === undefined &&
            bar_day.monday_active === undefined &&
            bar_day.tuesday_active === undefined &&
            bar_day.wednesday_active === undefined &&
            bar_day.thursday_active === undefined &&
            bar_day.friday_active === undefined &&
            bar_day.saturday_active === undefined
        ) {
            console.log('400 2')
            return res.status(400).json({
                success: false,
                message: 'Necessário informar os dias e horários'
            })
        }

        app.db('bar_day')
            .select('*')
            .where({ parceiroId: id })
            .then(rows => {
                console.log(rows)
                if (rows.length > 0) {
                    app.db('bar_day')
                        .where({ parceiroId: id })
                        .update({
                            sunday_active: bar_day['sunday_active'],
                            sunday_from: bar_day["sunday_from"] != undefined && bar_day["sunday_from"] != "" ? bar_day["sunday_from"] : null,
                            sunday_to: bar_day["sunday_to"] != undefined && bar_day["sunday_to"] != "" ? bar_day["sunday_to"] : null,
                            monday_active: bar_day['monday_active'],
                            monday_from: bar_day["monday_from"] != undefined && bar_day["monday_from"] != "" ? bar_day["monday_from"] : null,
                            monday_to: bar_day["monday_to"] != undefined && bar_day["monday_to"] != "" ? bar_day["monday_to"] : null,
                            tuesday_active: bar_day['tuesday_active'],
                            tuesday_from: bar_day["tuesday_from"] != undefined && bar_day["tuesday_from"] != "" ? bar_day["tuesday_from"] : null,
                            tuesday_to: bar_day["tuesday_to"] != undefined && bar_day["tuesday_to"] != "" ? bar_day["tuesday_to"] : null,
                            wednesday_active: bar_day['wednesday_active'],
                            wednesday_from: bar_day["wednesday_from"] != undefined && bar_day["wednesday_from"] != "" ? bar_day["wednesday_from"] : null,
                            wednesday_to: bar_day["wednesday_to"] != undefined && bar_day["wednesday_to"] != "" ? bar_day["wednesday_to"] : null,
                            thursday_active: bar_day['thursday_active'],
                            thursday_from: bar_day["thursday_from"] != undefined && bar_day["thursday_from"] != "" ? bar_day["thursday_from"] : null,
                            thursday_to: bar_day["thursday_to"] != undefined && bar_day["thursday_to"] != "" ? bar_day["thursday_to"] : null,
                            friday_active: bar_day['friday_active'],
                            friday_from: bar_day["friday_from"] != undefined && bar_day["friday_from"] != "" ? bar_day["friday_from"] : null,
                            friday_to: bar_day["friday_to"] != undefined && bar_day["friday_to"] != "" ? bar_day["friday_to"] : null,
                            saturday_active: bar_day['saturday_active'],
                            saturday_from: bar_day["saturday_from"] != undefined && bar_day["saturday_from"] != "" ? bar_day["saturday_from"] : null,
                            saturday_to: bar_day["saturday_to"] != undefined && bar_day["saturday_to"] != "" ? bar_day["saturday_to"] : null
                        })
                        .then(_ => res.status(200).send())
                        .catch(err => {
                            console.log("🚀 ~ file: parceiro.js:334 ~ daysBar ~ err", err)
                            return res.status(400).json(err)
                        })
                } else {
                    app.db('bar_day')
                        .insert({
                            parceiroId: id,
                            sunday_active: bar_day['sunday_active'],
                            sunday_from: bar_day["sunday_from"] != undefined && bar_day["sunday_from"] != "" ? bar_day["sunday_from"] : null,
                            sunday_to: bar_day["sunday_to"] != undefined && bar_day["sunday_to"] != "" ? bar_day["sunday_to"] : null,
                            monday_active: bar_day['monday_active'],
                            monday_from: bar_day["monday_from"] != undefined && bar_day["monday_from"] != "" ? bar_day["monday_from"] : null,
                            monday_to: bar_day["monday_to"] != undefined && bar_day["monday_to"] != "" ? bar_day["monday_to"] : null,
                            tuesday_active: bar_day['tuesday_active'],
                            tuesday_from: bar_day["tuesday_from"] != undefined && bar_day["tuesday_from"] != "" ? bar_day["tuesday_from"] : null,
                            tuesday_to: bar_day["tuesday_to"] != undefined && bar_day["tuesday_to"] != "" ? bar_day["tuesday_to"] : null,
                            wednesday_active: bar_day['wednesday_active'],
                            wednesday_from: bar_day["wednesday_from"] != undefined && bar_day["wednesday_from"] != "" ? bar_day["wednesday_from"] : null,
                            wednesday_to: bar_day["wednesday_to"] != undefined && bar_day["wednesday_to"] != "" ? bar_day["wednesday_to"] : null,
                            thursday_active: bar_day['thursday_active'],
                            thursday_from: bar_day["thursday_from"] != undefined && bar_day["thursday_from"] != "" ? bar_day["thursday_from"] : null,
                            thursday_to: bar_day["thursday_to"] != undefined && bar_day["thursday_to"] != "" ? bar_day["thursday_to"] : null,
                            friday_active: bar_day['friday_active'],
                            friday_from: bar_day["friday_from"] != undefined && bar_day["friday_from"] != "" ? bar_day["friday_from"] : null,
                            friday_to: bar_day["friday_to"] != undefined && bar_day["friday_to"] != "" ? bar_day["friday_to"] : null,
                            saturday_active: bar_day['saturday_active'],
                            saturday_from: bar_day["saturday_from"] != undefined && bar_day["saturday_from"] != "" ? bar_day["saturday_from"] : null,
                            saturday_to: bar_day["saturday_to"] != undefined && bar_day["saturday_to"] != "" ? bar_day["saturday_to"] : null
                        })
                        .then(_ => res.status(200).send())
                        .catch(err => {
                            console.log("🚀 ~ file: parceiro.js:365 ~ daysBar ~ err", err)
                            return res.status(400).json(err)
                        })
                }
            })

    }

    async function testCoords(req, res) {
        const coords = await getCoordsByAddress(req.query.address)
        res.status(200).json(coords)
    }

    return {
        save,
        getAllPathner,
        getFilterPartner,
        getPartner,
        getDrink,
        getPartnerById,
        editPathner,
        testCoords,
        deletePartner,
        daysBar,
        getDaysBar
    }
}
