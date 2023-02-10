const multer = require('multer');
const moment = require("moment");


module.exports = app => {
    const getAllDrink = (req, res) => {
        app.db('drink')
            .select('*')
            /* .table('drink')
            .innerJoin('drink_day', 'drink.id', 'drink_day.drinkId') */
            .where({ active: 'S' })
            .then(drink => {
                return res.json(drink)
            })
            .catch(err => res.status(401).json(err))
    }

    const getDrinkByUser = (req, res) => {
        app.db('drink')
            .select(
                '*'
            ).where({ id: req.user.id })
            .findFist()
            .then(drink => res.json(drink))
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

    const imageTeste = (req, res) => {

        upload.single('foto')(req, res, err => {
            if (err) {
                console.log(err)
                return res.status(500).json({ error: 1, payload: err });
            }
            const {
                name,
                ingredients,
                value,
                // drink_days
            } = req.body;

            if (!name || !ingredients || !value) {
                return res.status(400).json({
                    success: false,
                    errorMsg: 'empty fields'
                })
            } /* else             //validate drink days
                if (drink_days.sunday_active !== undefined ||
                    drink_days.monday_active !== undefined ||
                    drink_days.tuesday_active !== undefined ||
                    drink_days.wednesday_active !== undefined ||
                    drink_days.thursday_active !== undefined ||
                    drink_days.friday_active !== undefined ||
                    drink_days.saturday_active !== undefined
                ) {
                    return res.status(400).json({
                        success: false,
                        errorMsg: 'Necessário informar os dias e horários do Drink'
                    })

                }  else {
                    const image = {};
                    image.id = req.file?.filename;
                    image.url = `/uploads/${image.id}`;
                    //const data = JSON.parse(JSON.stringify(req.body))
                    app.db('drink')
                        .insert({
                            nomeDrink: name,
                            ingredientes: ingredients,
                            value: parseFloat(value),
                            imagemDrink: image.url,
                            parceiroId: req.user.id
                        })
                        .returning('id')
                        .then(drinkIds => {
                            const parsed_days = JSON.parse(drink_days);
                            app.db('drink_day')
                                .insert(
                                    {
                                        drinkId: drinkIds[0],
                                        sunday_active: parsed_days['sunday_active'],
                                        sunday_from: parsed_days["sunday_from"] != undefined && parsed_days["sunday_from"] != "" ? parsed_days["sunday_from"] : null,
                                        sunday_to: parsed_days["sunday_to"] != undefined && parsed_days["sunday_to"] != "" ? parsed_days["sunday_to"] : null,
                                        monday_active: parsed_days['monday_active'],
                                        monday_from: parsed_days["monday_from"] != undefined && parsed_days["monday_from"] != "" ? parsed_days["monday_from"] : null,
                                        monday_to: parsed_days["monday_to"] != undefined && parsed_days["monday_to"] != "" ? parsed_days["monday_to"] : null,
                                        tuesday_active: parsed_days['tuesday_active'],
                                        tuesday_from: parsed_days["tuesday_from"] != undefined && parsed_days["tuesday_from"] != "" ? parsed_days["tuesday_from"] : null,
                                        tuesday_to: parsed_days["tuesday_to"] != undefined && parsed_days["tuesday_to"] != "" ? parsed_days["tuesday_to"] : null,
                                        wednesday_active: parsed_days['wednesday_active'],
                                        wednesday_from: parsed_days["wednesday_from"] != undefined && parsed_days["wednesday_from"] != "" ? parsed_days["wednesday_from"] : null,
                                        wednesday_to: parsed_days["wednesday_to"] != undefined && parsed_days["wednesday_to"] != "" ? parsed_days["wednesday_to"] : null,
                                        thursday_active: parsed_days['thursday_active'],
                                        thursday_from: parsed_days["thursday_from"] != undefined && parsed_days["thursday_from"] != "" ? parsed_days["thursday_from"] : null,
                                        thursday_to: parsed_days["thursday_to"] != undefined && parsed_days["thursday_to"] != "" ? parsed_days["thursday_to"] : null,
                                        friday_active: parsed_days['friday_active'],
                                        friday_from: parsed_days["friday_from"] != undefined && parsed_days["friday_from"] != "" ? parsed_days["friday_from"] : null,
                                        friday_to: parsed_days["friday_to"] != undefined && parsed_days["friday_to"] != "" ? parsed_days["friday_to"] : null,
                                        saturday_active: parsed_days['saturday_active'],
                                        saturday_from: parsed_days["saturday_from"] != undefined && parsed_days["saturday_from"] != "" ? parsed_days["saturday_from"] : null,
                                        saturday_to: parsed_days["saturday_to"] != undefined && parsed_days["saturday_to"] != "" ? parsed_days["saturday_to"] : null
                                    })
                                .then(_ => {
                                    res.status(200).send(true)
                                })
                                .catch(err => {
                                    console.log(err)

                                    app.db('drink_day').where('id', drinkIds[0]).del()
                                        .then(_ => console.log(`Drink ${drinkIds[0]} deleted`))
                                        .catch(err => console.log(`Drink ${drinkIds[0]} not deleted`, err));

                                    res.status(500).json({
                                        success: false,
                                        errorMsg: `Erro ao inserir horários do Drink: ${err.message}`
                                    })

                                });

                        })
                        .catch(err => {
                            console.log(err)
                            res.status(400).json(err)
                        });

                } */

                else {
                    const image = {};
                    image.id = req.file?.filename;
                    image.url = `/uploads/${image.id}`;
                    app.db('drink')
                    .insert({
                        nomeDrink: name,
                        ingredientes: ingredients,
                        value: parseFloat(value),
                        imagemDrink: image.url,
                        parceiroId: req.user.id
                    })
                    .then(_ => {
                        res.status(200).send(true)
                    })
                    .catch(err => {
                        res.status(400).json(err)
                        console.log(err)
                    });
                }
        })

    }

    const selectDrinkByParther = (req, res) => {
        app.db('drink')
            .select(
                'id',
                'nomeDrink',
                'ingredientes',
                'imagemDrink',
                'parceiroId'
            )
            .where({
                parceiroId: req.user.id,
                active: 'S'
            })
            .then(partner => {
                res.json(partner)
            })
            .catch(err => res.status(401).json(err))
    }

    const createDrink = (req, res) => {

        app.db('drink')
            .insert({
                nomeDrink: req.body.nomeDrink,
                ingredientes: req.body.nomeDrink,
                parceiroId: req.user.id
            })
            .then(_ => res.status(200).send())
            .catch(err => res.status(400).json(err))
    }


    const updateDrink = (req, res) => {

        app.db('drink')
            .where({ id: req.body.parceiroId })
            .update(req.body)
            .then(_ => res.status(200).send({ sucsses: true }))
            .catch(err => res.status(400).json(err))

    }

    const deleteDrink = (req, res) => {
        app.db('drink')
            .where({ id: req.params.id, parceiroId: req.parceiro.id })
            .del()
            .then(rowsDeleted => {
                if (rowsDeleted > 0) {
                    res.status(204).send()
                } else {
                    const msg = `drink não encontrado ${req.params.id}.`
                    res.status(400).send(msg)
                }
            })
            .catch(err => res.status(400).json(err))
    }

    function historyDrink(req, res) {

        let initialDate = ""
        let finalDate = ""

        const lastDay = (month, year) => {
            let date = new Date(`${year}-${month}-01`)
            return new Date(date.getFullYear(), month, 0).getDate()
        }

        const checkDateGreateToday = (date) => {
            dateCheck = new Date(date)
            dateToday = new Date()

            if (dateCheck > dateToday)
                return dateToday

            return dateCheck
        }

        const { user } = req

        if (!user || !user.id)
            return res.status(401).json({ success: false })

        const { day, month, year } = req.query

        if (year && year > new Date().getFullYear())
            return res.status(401).json({ success: false, message: "Ano não pode ser maior que o atual." })

        if (day && !month)
            return res.status(401).json({ success: false, message: "Mês precisa ser definido." })

        if ((day || month) && !year)
            return res.status(401).json({ success: false, message: "Ano precisa ser definido." })

        if (!day && month && year) {
            initialDate = new Date(`${year}-${month}-01`)
            finalDate = new Date(`${year}-${month}-${lastDay(month, year)}`)
        }

        if (!day && !month && year) {
            initialDateTemp = new Date(`${year}-01-01`)
            initialDate = moment(initialDateTemp).utc()

            finalDateTemp = new Date(`${year}-12-31`)
            finalDate = moment(checkDateGreateToday(finalDateTemp)).utc().format()
        }

        app.db('order')
            .select('order.id',
                'order.date_solicitation',
                'order.drinkId',
                'order.value',
                'drink.nomeDrink',
                'drink.ingredientes',
                'drink.imagemDrink',)
            .join('drink', 'drink.id', 'order.drinkId')
            .where({ parceiroId: user.id })
            .modify(function (queryBuilder) {
                if (day && month && year) {
                    queryBuilder.where('date_solicitation', '=', moment(checkDateGreateToday(new Date(`${year}-${month}-${day}`))).utc().format());
                }
                if (initialDate !== '' && finalDate !== "") {
                    queryBuilder.whereBetween('date_solicitation', [moment(initialDate).utc().format(), moment(finalDate).utc().format()]);
                }
            })
            .orderBy('order.id', 'DESC')
            .then(result => res.status(200).json(result))

    }

    function historyDrinkUser(req, res) {
        let initialDate = ""
        let finalDate = ""

        const lastDay = (month, year) => {
            let date = new Date(`${year}-${month}-01`)
            return new Date(date.getFullYear(), month, 0).getDate()
        }

        const checkDateGreateToday = (date) => {
            dateCheck = new Date(date)
            dateToday = new Date()

            if (dateCheck > dateToday)
                return dateToday

            return dateCheck
        }

        const { userId } = req.query

        if (!userId)
            return res.status(401).json({ success: false, message: "É necessário definir o usuário." })

        const { day, month, year } = req.query

        if (year && year > new Date().getFullYear())
            return res.status(401).json({ success: false, message: "Ano não pode ser maior que o atual." })

        if (day && !month)
            return res.status(401).json({ success: false, message: "Mês precisa ser definido." })

        if ((day || month) && !year)
            return res.status(401).json({ success: false, message: "Ano precisa ser definido." })

        if (!day && month && year) {
            initialDate = new Date(`${year}-${month}-01`)
            finalDate = new Date(`${year}-${month}-${lastDay(month, year)}`)
        }

        if (!day && !month && year) {
            initialDateTemp = new Date(`${year}-01-01`)
            initialDate = moment(initialDateTemp).utc()

            finalDateTemp = new Date(`${year}-12-31`)
            finalDate = moment(checkDateGreateToday(finalDateTemp)).utc().format()
        }

        app.db('order')
            .select('order.id',
                'order.date_solicitation',
                'order.drinkId',
                'order.value',
                'drink.nomeDrink',
                'drink.ingredientes',
                'drink.imagemDrink',)
            .join('drink', 'drink.id', 'order.drinkId')
            .where({ userId: userId })
            .modify(function (queryBuilder) {
                if (day && month && year) {
                    queryBuilder.where('date_solicitation', '=', moment(checkDateGreateToday(new Date(`${year}-${month}-${day}`))).utc().format());
                }
                if (initialDate !== '' && finalDate !== "") {
                    queryBuilder.whereBetween('date_solicitation', [moment(initialDate).utc().format(), moment(finalDate).utc().format()]);
                }
            })
            .orderBy('order.id', 'DESC')
            .then(result => res.status(200).json(result))

    }

    function mostRequestDrink(req, res) {

        const { drinkId } = req.query
        const parceiroId = req.user.id
        app.db('drink')
            .select('orders.quantity', 'drink.*')
            .rightJoin(
                app.db('order')
                    .select('order.drinkId as drinkId')
                    .count('order.drinkId as quantity')
                    .join('drink', 'drink.id', 'order.drinkId')
                    .groupBy('order.drinkId')
                    .orderBy('order.drinkId', 'ASC')
                    .where({ parceiroId })
                    .modify(function (queryBuilder) {
                        if (drinkId)
                            queryBuilder.where('order.drinkId', '=', drinkId)
                    })
                    .as('orders'),
                'drink.id', 'orders.drinkId')
            .then(async result => {
                res.status(200).json(result)
            })
    }

    async function validateDrink(req, res) {
        const {
            userId,
            drinkId
        } = req.body

        if (!userId || !drinkId || userId == 0 || userId == "" || drinkId == 0 || drinkId == "")
            return res.status(400).json({
                success: false,
                errorMsg: 'drinkId or userId is empty'
            })

        app.db('order')
            .where({ userId })
            .orderBy('id', 'DESC')
            .limit(1)
            .then(result => {
                const lastDate = new Date(result[0] ? result[0].date_solicitation : 0)
                const today = new Date
                const nextValidationDate = new Date(lastDate)

                nextValidationDate.setDate(lastDate.getDate() + 1)
                nextValidationDate.setHours(5, 0, 0, 0)
                if (!result[0] || today >= nextValidationDate)
                    return app.db('drink')
                        .where({ id: drinkId })
                        .then(drink => {
                            const date_solicitation = new Date
                            if (!drink[0])
                                return res.status(404).json({
                                    success: false,
                                    errorMsg: 'drink not found'
                                })
                            const { value } = drink[0]
                            app.db('order')
                                .insert({
                                    userId,
                                    drinkId,
                                    value,
                                    date_solicitation
                                })
                                .then(_ => res.status(200).json({ success: true }))
                                .catch(err => res.status(400).json(err))
                        })

                return res.status(200).json({
                    success: false,
                    errorMsg: 'no drinks available'
                })
            })


    }

    function toggleDrink(req, res) {
        const { id } = req.body
        if (!id)
            return res.status(400).json({
                success: false,
                errorMsg: 'empty id field'
            })
        app.db('drink')
            .where({ id })
            .then(drink => {
                console.log(req.user)
                if (!drink[0])
                    return res.status(404).json({
                        success: false,
                        errorMsg: 'not found drink'
                    })
                if (drink[0].parceiroId != req.user.id)
                    return res.status(401).json({
                        success: false,
                        errorMsg: 'not drink owner'
                    })
                if (drink[0].active == 'S')
                    return app.db('drink')
                        .where({ id: drink[0].id })
                        .update({ active: 'N' })
                        .then(_ => res.status(200).json({ success: true }))
                        .catch(err => res.status(200).json({ success: false, ...err }))
                return app.db('drink')
                    .where({ id: drink[0].id })
                    .update({ active: 'S' })
                    .then(result => res.status(200).json({ success: true }))
                    .catch(err => res.status(200).json({ success: false, ...err }))
            })
            .catch(err => res.status(400).json(err))
    }

    return {
        createDrink,
        updateDrink,
        deleteDrink,
        imageTeste,
        selectDrinkByParther,
        getAllDrink,
        historyDrink,
        historyDrinkUser,
        validateDrink,
        mostRequestDrink,
        toggleDrink,
    };
}
