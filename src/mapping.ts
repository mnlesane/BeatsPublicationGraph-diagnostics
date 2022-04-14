import {
  BigInt,
  JSONValue,
  Value,
  log,
  json,
  JSONValueKind,
  ByteArray,
  Bytes
} from "@graphprotocol/graph-ts";
import { PostCreated } from "../generated/PublishingLogic/PublishingLogic";
import { PublicationEntity, MetadataEntity } from "../generated/schema";

export function handlePublication(event: PostCreated): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  // let entity = LensHub.bind(event.transaction.from.toHex())
  let entity = PublicationEntity.load(event.params.pubId.toHex());

  if (!entity) {
    entity = new PublicationEntity(event.params.pubId.toHex());
  }

  entity.profileId = event.params.profileId.toHex();
  entity.pubId = event.params.pubId.toHex();
  entity.contentURI = event.params.contentURI.toString();
  entity.timestamp = event.params.timestamp.toString();
  let contentURI = event.params.contentURI;

  // if (
  //   contentURI.includes('"traitType":"Genre"') &&
  //   contentURI.includes('"traitType":"Beats Per Minute"') &&
  //   contentURI.includes('"traitType":"Key Scale"') &&
  //   contentURI.includes('"traitType":"Beat Type"')
  // ) {
  //   entity.save();
  // }

  let data = event.params.contentURI;
  log.info("Hello 1 ************* {}", [data]);
  if (!data) return;
  let value = json.try_fromString(data);
  log.info("Hello a ************{}", [typeof value]);
  if (!value) {
    return;
  }
  if (!value.isOk) {
    return;
  }
  log.info("Hello 2 *************", []);
  if (value.value.kind !== JSONValueKind.OBJECT) {
    return;
  }
  log.info("Hello 3 ************* '{}'", [value.value.kind.toString()]);
  let parsedObj = value.value.toObject();
  log.info("DEBUG - Successfully parsed object.", []);
  if (!parsedObj) {
    log.info("Hello 4 ************", []);
    return;
  }
  let metadataId = parsedObj.get("metadata_id");
  if (!metadataId) {
    log.info("Unable to get metadata ID.", []);
    return;
  }
  let attributes = parsedObj.get("attributes");
  if (!attributes) {
    log.info("Unable to get attributes.", []);
    return;
  }
  let attributeArray = attributes.toArray();
  let genre = jsonToString(attributeArray[0]);
  let bpm = jsonToBigInt(attributeArray[1]);
  let keyScale = jsonToString(attributeArray[2]);
  let type = jsonToString(attributeArray[3]);
  if (!genre) {
    log.info("Unable to get genre.", []);
    return;
  }
  if (!bpm) {
    log.info("Unable to get bpm.", []);
    return;
  }
  if (!keyScale) {
    log.info("Unable to get keyscale.", []);
    return;
  }
  if (!type) {
    log.info("Unable to get type.", []);
    return;
  }

  let metadataEntity = MetadataEntity.load(metadataId.toString());
  if (!metadataEntity) {
    metadataEntity = new MetadataEntity(metadataId.toString());
  }
  metadataEntity.save();
  entity.metadata = metadataId.toString();
}

export function jsonToString(val: JSONValue | null): string {
  if (val != null && val.kind === JSONValueKind.STRING) {
    return val.toString()
  }
  return ''
}
export function jsonToBigInt(val: JSONValue | null): BigInt {
  if (val != null && val.kind === JSONValueKind.NUMBER) {
    return BigInt.fromI64(val.toI64())
  }
  return BigInt.fromI64(0)
}
