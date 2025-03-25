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
    ],
}