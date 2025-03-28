import { platform } from "os";

export default {
    async findDesserts(ctx){
        try {
            const allDesserts = await strapi.documents('api::dailymenu.dailymenu').findMany({
                fields : 'day',
                populate: {
                    dessert:{
                        fields : ['name','price']
                    }
                }
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
                        first: {
                            populate: {
                                allergens: {
                                    fields: 'name',
                                }
                            }
                        },
                        second: {
                            populate: {
                                allergens: {
                                    fields: 'name',
                                }
                            }
                        },
                        dessert: {
                            populate: {
                                allergens: {
                                    fields: 'name',
                                }
                            }
                        }
                    }
                });
                console.log(menu)

                const filterss = menu.filter(m =>{
                    const { first, second, dessert } = m;

                    const firstAller  = first?.allergens.some(al => allergensToExclude.includes(al.name));
                    const secondAller  = second?.allergens.some(al => allergensToExclude.includes(al.name));
                    const dessertAller  = dessert?.allergens.some(al => allergensToExclude.includes(al.name));

                    return !firstAller && !secondAller && !dessertAller
                })

                return ctx.send({data: filterss})
            }

            const menus = await strapi.documents('api::dailymenu.dailymenu').findMany({
                filters:{
                    menuPrice:{
                        $gte: min_price,
                        $lte: max_price
                    }
                }
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

            console.log("query -----------", ctx.query)

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
                }
            });

            const nameCount = {}

            for (const menu of menus) {
                const { first, second, dessert } = menu;
                
                // Usar un array para procesar los tres tipos de platos de manera más concisa
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
            console.log(nameCount)

            // Ordenar el array de mayor a menor frecuencia
            namesArray.sort((a, b) => b.count - a.count);

            // Mostrar los resultados ordenados
            console.log('Nombres ordenados por frecuencia (de mayor a menor):');

            const dishes = await Promise.all(
                namesArray.map(async (item) => {
                    const dish = await strapi.service('api::dailymenu.01-custom-dailymenu').findDishes(item.documentId);
                    return {
                        message: `número de repeticiones = ${item.count}`,
                        data: dish
                    };
                })
            );
            console.log(dishes);
            return ctx.send(dishes);

        } catch (error) {
            return ctx.badRequest('No se ha encontrado datos de la consulta de los platos populares')
        }
    },
}