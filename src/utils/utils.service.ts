export class UtilsService {

    static replaceChannel(channel: string): string{
        return channel.replace(/(SIP\/)(\d{3})-(.*)/, `$2`);
    };

    static async sleep(ms: number): Promise<unknown> {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    }

    static normalizePhoneNumber(phoneNumber: string): string {
        const digits = phoneNumber.replace(/\D/g, '');
        if (digits.startsWith('8')) {
            return '7' + digits.slice(1);
        }

        if (digits.startsWith('+7')) {
            return digits.slice(1);
        }

        if (digits.length == 10) {
            return '7' + digits;
        }

        return digits;
    }

    static frmat1CPhone(clientPhone: string): string {
        const phoneNum = clientPhone.replace(/\)/g, '').replace(/\(/g, '');
        return (phoneNum.length == 10)? `7${phoneNum}` : `7${phoneNum.slice(1,11)}`;
    }
}
