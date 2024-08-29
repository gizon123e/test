const Pengiriman = require("../../models/model-pengiriman");
const Notifikasi = require("../../models/notifikasi/notifikasi")
const DetailNotifikasi = require("../../models/notifikasi/detail-notifikasi")
const { io } = require("socket.io-client");
const Invoice = require("../../models/model-invoice");

const socket = io(process.env.HOST, {
    auth: {
        fromServer: true
    }
})
function formatTanggal(tanggal){
    const dd = String(tanggal.getDate()).padStart(2, '0');
    const mm = String(tanggal.getMonth() + 1).padStart(2, '0');
    const yyyy = tanggal.getFullYear();
    return `${yyyy}-${mm}-${dd}`
}

function formatWaktu(waktu){
    const hh = String(waktu.getHours()).padStart(2, '0');
    const mn = String(waktu.getMinutes()).padStart(2, '0');
    const ss = String(waktu.getSeconds()).padStart(2, '0');
    return `${hh}:${mn}:${ss}`
}

module.exports = {
    requestPickUp: async (req, res, next) => {
        try {
            const pengiriman = await Pengiriman.findByIdAndUpdate(req.params.id, { isRequestedToPickUp: true })
            .populate("distributorId")
            .populate("productToDelivers.productId")

            if (!pengiriman){
                return res.status(404).json({ message: `Pengiriman dengan Id ${req.params.id} tidak ditemukan` })
            } 
            const notifDistributor = await Notifikasi.findOne({ userId: pengiriman.distributorId.userId }).sort({ createdAt: -1 })
            DetailNotifikasi.create({
                notifikasiId: notifDistributor._id,
                status: "Pesanan yang akan dikirim telah dikemas",
                message: `Yuk jemput pesanan ${pengiriman.kode_pengiriman} lalu segera kirim ke alamat tujuan konsumen`,
                jenis: "Pesanan",
                image_product: pengiriman.productToDelivers[0].productId.image_product[0],
                createdAt: new Date()
            })
            .then(() => console.log("Berhasil simpan notif distributor"))
            .catch(() => console.log("Gagal simpan notif distributor"))

            socket.emit('notif_distri_sudah_dikemas', {
                jenis: "Pesanan",
                userId: pengiriman.distributorId.userId,
                status: "Pesanan yang akan dikirim telah dikemas",
                message: `Yuk jemput pesanan ${pengiriman.kode_pengiriman} lalu segera kirim ke alamat tujuan konsumen`,
                image: pengiriman.productToDelivers[0].productId.image_product[0],
                tanggal: `${formatTanggal(new Date())} ${formatWaktu(new Date())}`

            })
            return res.status(200).json({ message: "update data success" })
        } catch (error) {
            console.log(error);
            next(error);
        }
    },

    createPencarianUlangDistributor: async (req, res, next) => {
        try {
            const { orderId, id_toko, kode_pengiriman, distributorId, id_jenis_kendaraan, id_jenis_layanan, potongan_ongkir, ongkir } = req.body

            if (!orderId || !id_toko || !kode_pengiriman || !distributorId || !id_jenis_kendaraan, !id_jenis_layanan, !potongan_ongkir) {
                return res.status(400).json({ message: "orderId, id_toko, kode_pengiriman, distributorId, id_jenis_kendaraan, id_jenis_layanan, potongan_ongkir harus di isi" })
            }

            const pengiriman = await Pengiriman.find({ orderId, id_toko, kode_pengiriman });
            const invoices = await Invoice.find({_id: { $in: pengiriman }});
            console.log(invoices)
            if (!pengiriman || pengiriman.length === 0) return res.status(404).json({ message: `Pengiriman tidak ditemukan` })

            await Pengiriman.updateMany({ orderId, id_toko, kode_pengiriman }, {
                distributorId,
                status_distributor: "Pesanan terbaru",
                rejected: false,
                status_pengiriman: 'diproses',
                id_jenis_kendaraan,
                jenis_pengiriman: id_jenis_layanan,
                potongan_ongkir,
                total_ongkir: parseInt(ongkir) - parseInt(potongan_ongkir),
                ongkir: parseInt(ongkir)
            })

            res.status(200).json({ message: "update data success" })
        } catch (error) {
            console.log(error);
            next(error)
        }
    }
}