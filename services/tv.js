module.exports = {
    set_best_resource(tv) {
        let resources = tv.resources
        delete tv.resources
        resources.sort((a, b) => {
            let wa = a.status * -1000 + (a.is_vip ? -100 : 0)
            let wb = b.status * -1000 + (b.is_vip ? -100 : 0)
            return wb - wa
        })
        tv.resource = resources[0]
    }
}