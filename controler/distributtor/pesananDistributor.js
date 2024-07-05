const Distributtor = require("../../models/distributor/model-distributor")
const { io } = require("socket.io-client");
const Pengiriman = require("../../models/model-pengiriman");
const Product = require("../../models/model-product");

module.exports = {
    getAllPesananDistributor: async (req, res, next) => {
        try {
            const datas = await Pengiriman.find({ distributorId: req.params.id })
                .populate({
                    path: "orderId",
                    populate: "addressId"
                })
                .populate("distributorId")
                .populate({
                    path: "id_toko",
                    populate: "address"
                })
                .populate("id_jenis_kendaraan")
                .populate("jenis_pengiriman")
            if (!datas) return res.status(404).json({ message: "saat ini data pesanan distributor" })

            res.status(200).json({ message: "get data All success", datas })
        } catch (error) {
            console.log(error)
            next(error)
        }
    },

    ubahStatus: async (req, res, next) => {
        try {
            const { status } = req.body
            if (!status) return res.status(400).json({ message: "Tolong kirimkan status" });

            const statusAllowed = ['dikirim', 'pesanan selesai', 'dibatalkan']
            if (!statusAllowed.includes(status)) return res.status(400).json({ message: `Status tidak valid` });

            const pengiriman = await Pengiriman.findById(req.params.id).populate('orderId')
            if (!pengiriman) return res.status(404).json({ message: `Tidak ada pengiriman dengan id: ${req.params.id}` });

            const distri = await Distributtor.findById(pengiriman.distributorId)
            if (distri.userId.toString() !== req.user.id) return res.status(403).json({ message: "Tidak Bisa Mengubah Pengiriman Orang Lain!" });

            if (status === "dibatalkan") {
                await Pengiriman.updateOne({ _id: req.params.id }, { rejected: true });

                const currentDate = new Date();
                const formattedDate = currentDate.toISOString().split('T')[0]

                const currentDateResert = new Date();
                currentDateResert.setDate(currentDateResert.getDate() + 1);
                const formattedDateResert = currentDateResert.toISOString().split('T')[0]

                await Distributtor.findByIdAndUpdate({ _id: distri._id }, { tolak_pesanan: distri.tolak_pesanan + 1, date_activity: formattedDate, date_resert: formattedDateResert }, { new: true })
            } else {
                await Pengiriman.updateOne({ _id: req.params.id }, {
                    status_pengiriman: status
                });
            }

            const socket = io('https://probable-subtly-crawdad.ngrok-free.app', {
                auth: {
                    fromServer: true
                }
            })
            const prodIds = pengiriman.productToDelivers.map(item => {
                return item.productId
            })

            const products = await Product.find({ _id: { $in: prodIds } })
            for (const product of products) {
                socket.emit('notif_order', { userId: pengiriman.orderId.userId, message: `Pesanan ${product.name_product} telah dikirim` })
            }
            // socket.disconnect()
            return res.status(200).json({ message: "Berhasil Mengubah Status Pengiriman" })
        } catch (error) {
            console.log(error);
            next(error)
        }
    }
}