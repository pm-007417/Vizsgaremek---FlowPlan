const notAllowed = (req, res) => {
    res.status(405).json({
        "hiba": "A kérés nem engedélyezett!",
        "magyarazat": `A ${req.method} nem támogatott a(z) ${req.originalUrl} url alatt.`
    })
}

module.exports = { notAllowed }