export default{
    routes:[
        {
            method : 'GET',
            path: '/dailymenus/desserts',
            handler: '01-custom-dailymenu.findDesserts',
            config: {
                policies: [],
                middlewares: []
            },
        },
        {
            method : 'GET',
            path: '/dailymenus',
            handler: '01-custom-dailymenu.findMenusByRangeOfPrice',
            config: {
                policies: [],
                middlewares: []
            },
        },
        {
            method : 'GET',
            path: '/dailymenus/populares',
            handler: '01-custom-dailymenu.popularDishes',
            config: {
                policies: [],
                middlewares: []
            },
        },
    ],
}