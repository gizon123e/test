const jsotp = require('jsotp');
module.exports = (secretKey) => {
    const epoch = Math.floor(new Date().getTime() / 1000); // Waktu saat ini dalam detik
    const timeInterval = 30; // Interval waktu dalam detik
    const counter = Math.floor(epoch / timeInterval); // Hitung counter

    // Konversi counter menjadi string hexa dengan panjang 16 karakter
    const counterHex = ('0000000000000000' + counter.toString(16)).slice(-16);

    // Konversi secret key menjadi buffer
    const keyBuffer = Buffer.from(secretKey, 'utf8');

    // Buat objek jsSHA dengan algoritma HMAC-SHA1
    const shaObj = new jsSHA('SHA-1', 'BYTES');
    shaObj.setHMACKey(keyBuffer, 'BYTES');

    // Hitung HMAC dari counter
    shaObj.update(counterHex);
    const hmac = shaObj.getHMAC('HEX');

    // Ambil sebagian dari HMAC (6 digit terakhir)
    const offset = parseInt(hmac.substr(hmac.length - 1), 16) * 2;
    const otp = (parseInt(hmac.substr(offset, 8), 16) & 0x7fffffff) % 1000000;

    // Format OTP agar selalu 6 digit
    const formattedOTP = ('000000' + otp).slice(-6);

    return formattedOTP;
}

function generate(secretKey){
    const totp = jsotp.TOTP("SECRET", 300)
    // const kode =  totp.verify(329414)
    console.log(totp)
}
generate()