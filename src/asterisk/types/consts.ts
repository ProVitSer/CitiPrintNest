import { AsteriskCallStatus, Context, TrunkId } from "./enum"
import { RouteInfo } from "./interfaces"

export const ASTERISK_CALL_STATUS_BITRIX_MAP: { [status in AsteriskCallStatus]: string } = {
    [AsteriskCallStatus.NOANSWER] : "480",
    [AsteriskCallStatus.ANSWERED] : "200",
    [AsteriskCallStatus.BUSY] : "486"

}

export const GET_ROUTE_INFO : { [exten: string]: RouteInfo } = {
    ['00018'] : {
        trunkId: TrunkId.baza,
        defaultContext: Context.defaultBaza,
        localContext: Context.localBaza
    },
    ['79264612222'] : {
        trunkId: TrunkId.miltifon,
        defaultContext: Context.defaultMultifon,
        localContext: Context.localMultifon,
    }
}