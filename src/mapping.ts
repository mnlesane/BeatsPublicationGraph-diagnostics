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
  let contentURI = event.params.contentURI.toString();

  if (
    contentURI.includes('"traitType":"Genre"') &&
    contentURI.includes('"traitType":"Beats Per Minute"') &&
    contentURI.includes('"traitType":"Key Scale"') &&
    contentURI.includes('"traitType":"Beat Type"')
  ) {
    entity.save();
  }

  let data = event.params.contentURI.toString();
  log.info("Hello 1 ************* {}", [data]);
  if (!data) return;
  let value = json.try_fromBytes(changetype<Bytes>(data));
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
  log.info("Hello 3 *************", []);
  let parsedObj = value.value.toObject();
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
  let genre = attributeArray[0].toString();
  let bpm = attributeArray[1].toI64();
  let keyScale = attributeArray[2].toString();
  let type = attributeArray[3].toString();
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
