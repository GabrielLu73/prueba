export default {
    async findDesserts(ctx){
        try {
            const allDesserts = await strapi.documents('api::dailymenu.dailymenu').findMany({
                populate: {
                    dessert:{
                        fields :'*'
                    }
                }
            });

            return ctx.send({message : "Funcionaaaaa" ,data : allDesserts})

        } catch (error) {
            return ctx.badRequest('No se ha encontrado datos de la consulta')
        }
    },
    async findMenusByRangeOfPrice(ctx){

    }
}