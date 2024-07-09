const Distributtor = require("../../models/distributor/model-distributor")
const { io } = require("socket.io-client");
const Pengiriman = require("../../models/model-pengiriman");
const Product = require("../../models/model-product");

module.exports = {
    getAllPesananDistributor: async (req, res, next) => {
        try {
            const { status, page = 1, limit = 5 } = req.query
            const skip = (page - 1) * limit;

            let query = {
                distributorId: req.params.id
            }

            if (status) {
                query.status_distributor = { $regex: status, $options: 'i' }
            }

            const datas = await Pengiriman.find(query)
                .populate({
                    path: "orderId",
                    populate: "addressId"
                })
                .populate({
                    path: "distributorId",
                    populate: "alamat_id"
                })
                .populate({
                    path: "id_toko",
                    populate: "address"
                })
                .populate("id_jenis_kendaraan")
                .populate("jenis_pengiriman")
                .populate({
                    path: "productToDelivers.productId",
                    model: "Product",
                    populate: {
                        path: "categoryId"
                    }
                })
                .sort({ createdAt: -1 }) // Urutkan berdasarkan createdAt descending
                .skip(skip) // Lewati dokumen sesuai dengan nilai skip
                .limit(parseInt(limit));

            if (!datas) return res.status(404).json({ message: "saat ini data pesanan distributor" })

            datas.sort((a, b) => {
                return new Date(b.createdAt) - new Date(a.createdAt);
            });

            res.status(200).json({ message: "get data All success", datas })
        } catch (error) {
            console.log(error)
            next(error)
        }
    },

    updateOrderStatuses: async () => {
        try {
            const currentTime = new Date();
            const twentyFourHoursAgo = new Date(currentTime.getTime() - 24 * 60 * 60 * 1000);

            const orders = await Pengiriman.find({
                status_distributor: { $ne: "Kadaluwarsa" }, // Ensure we only update non-expired orders
                createdAt: { $lte: twentyFourHoursAgo }
            });

            for (const order of orders) {
                order.status_distributor = "Kadaluwarsa";
                await order.save();
            }

            console.log(`${orders.length} orders updated to "Kadaluwarsa".`);
        } catch (error) {
            console.error('Error updating order statuses:', error);
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
                await Pengiriman.updateOne({ _id: req.params.id }, { rejected: true, status_distributor: "Ditolak" });

                await Distributtor.findByIdAndUpdate({ _id: distri._id }, { tolak_pesanan: distri.tolak_pesanan + 1 }, { new: true })
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
                socket.emit('notif_order', {
                    jenis: 'pesanan',
                    userId: pengiriman.orderId.userId,
                    message: `Pesanan ${product.name_product} telah dikirim`,
                    image: product.image_product[0],
                    status: "Pesanan dalam Pengiriman"
                })
            }
            // socket.disconnect()
            return res.status(200).json({ message: "Berhasil Mengubah Status Pengiriman" })
        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    updatePelanggaranDistributor: async (req, res, next) => {
        try {
            const currentTime = new Date();
            const twentyFourHoursAgo = new Date(currentTime.getTime() - 23 * 60 * 60 * 1000);

            const dataRisertAnkaPelanggaran = await Distributtor.find({
                updatedAt: { $lte: twentyFourHoursAgo }
            })

            for (let id of dataRisertAnkaPelanggaran) {
                await Distributtor.updateOne({ _id: id._id }, { tolak_pesanan: 0 })
            }

            console.log(`${dataRisertAnkaPelanggaran.length} distributor violations reset to 0.`);
        } catch (error) {
            console.error('Error updating pelanggaran distributor statuses:', error);
        }
    }
}
