export default {
    async findDesserts(ctx){
        try {
            const allDesserts = await strapi.documents('api::dailymenu.dailymenu').findMany({
                fields : '*',
                populate: {
                    dessert:{
                        fields : ['name','price']
                    }
                },
                status: 'published',
            });

            return ctx.send({message : "datos de los postres" ,data : allDesserts})

        } catch (error) {
            return ctx.badRequest('No se ha encontrado datos de la consulta')
        }
    },
    async findMenusByRangeOfPrice(ctx){
        try {
            const {min_price, max_price, exclude_allergens} = ctx.request.query;

            if(exclude_allergens){
                const allergensToExclude = exclude_allergens.split(',').map(allergen => allergen.trim());
                
                const menu = await strapi.documents('api::dailymenu.dailymenu').findMany({
                    populate: { 
                        first: { populate: { allergens: { fields: 'name',}}},
                        second: { populate: { allergens: { fields: 'name',}}},
                        dessert: { populate: { allergens: { fields: 'name',}}}
                    },
                    status: 'published',
                })

                const filtersMenu = menu.filter(menu =>{
                    const { first, second, dessert } = menu;

                    const firstAllergen  = first?.allergens.some(allergen => allergensToExclude.includes(allergen.name));
                    const secondAllergen  = second?.allergens.some(allergen => allergensToExclude.includes(allergen.name));
                    const dessertAllergen  = dessert?.allergens.some(allergen => allergensToExclude.includes(allergen.name));

                    return !firstAllergen && !secondAllergen && !dessertAllergen
                });

                return ctx.send({data: filtersMenu})    
            }

            const menus = await strapi.documents('api::dailymenu.dailymenu').findMany({
                filters:{
                    menuPrice:{
                        $gte: min_price,
                        $lte: max_price
                    }
                },
                status: 'published',
            });
            
            return ctx.send({message: "datos de los menus por precios", data: menus});

        } catch (error) {
            return ctx.badRequest('No se ha encontrado datos de la consulta de menus por rango');
        }
    },
    async findMenuWithFor(ctx){
        try {
            const minPrice = ctx.query.minPrice;
            const maxPrice = ctx.query.maxPrice;

            const menus = await strapi.documents('api::dailymenu.dailymenu').findMany();
            const menufilter = [];

            for(const menu of menus){
                const { menuPrice } = menu;
                if(menuPrice >= minPrice && menuPrice <= maxPrice){
                    menufilter.push(menu)
                }
            }
            return ctx.send({message: "datos de los menus por precios", data: menufilter})

        } catch (error) {
            return ctx.badRequest('No se ha encontrado datos de la consulta de menus por rango o alergenos')
        }
    },
    async popularDishes(ctx){
        try {
            const menus = await strapi.documents('api::dailymenu.dailymenu').findMany({
                populate: { 
                    first: { populate: { allergens: { fields: 'name',}}},
                    second: { populate: { allergens: { fields: 'name',}}},
                    dessert: { populate: { allergens: { fields: 'name',}}}
                },
                status: 'published',
            });

            const nameCount = {}

            for (const menu of menus) {
                const { first, second, dessert } = menu;
                
                [first, second, dessert].forEach(dish => {
                    if (dish?.documentId) {
                        nameCount[dish.documentId] = (nameCount[dish.documentId] || 0) + 1;
                    }
                });
            }
            
            const namesArray = [];
            for (const name in nameCount) {
                namesArray.push({ documentId: name, count: nameCount[name] });
            }

            namesArray.sort((a, b) => b.count - a.count);

            const dishes = await Promise.all(
                namesArray.map(async (item) => {
                    const dish = await strapi.service('api::dailymenu.01-custom-dailymenu').findDishes(item.documentId);
                    return {
                        message: `número de repeticiones = ${item.count}`,
                        data: dish
                    };
                })
            );

            return ctx.send(dishes);

        } catch (error) {
            return ctx.badRequest('No se ha encontrado datos de la consulta de los platos populares')
        }
    },
    async pop(ctx){
        try {
            const menus = await strapi.documents('api::dailymenu.dailymenu').findMany({
                populate: {
                    first:{
                        fields: ['name']
                    },
                    second:{
                        fields: ['name']
                    },
                    dessert:{
                        fields: ['name']
                    }
                },
                status: 'published',
            });

            const nameCount = {}

            for(const menu of menus){
                const { first, second,dessert } = menu;
                [first,second,dessert].forEach(dish => {
                    if(dish?.name){
                        nameCount[dish.name] = (nameCount[dish.name] || 0) + 1;
                    }
                });
            }

            const dishesList = Object.entries(nameCount)
                .sort(([, a], [, b]) => +b - +a)  
                .reduce((obj, [key, value]) => { 
                    obj[key] = value as number;
                    return obj;
                }, {} as Record<string, number>) 

            ctx.send({message:"Lista de los platos y sus repeticiónes", data : dishesList})


        } catch (error) {   
            return ctx.badRequest('No hay datos encontrados')
        }
    }
}