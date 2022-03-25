import {
  BigInt,
  ipfs,
  JSONValue,
  Value,
  log,
  json,
  JSONValueKind,
  ByteArray,
} from "@graphprotocol/graph-ts";
import { PostCreated } from "../generated/PublishingLogic/PublishingLogic";
import { PublicationEntity, MetadataEntity } from "../generated/schema";

export function processItem(value: JSONValue, userData: Value): void {
  // See the JSONValue documentation for details on dealing
  // with JSON values
  let obj = value.toObject();
  let id = obj.get("id");
  let bpm = obj.get("bpm");
  let genre = obj.get("genre");
  let keyScale = obj.get("keyScale");
  let type = obj.get("type");

  if (!id || !bpm || !genre || !keyScale || !type) {
    return;
  }

  // Callbacks can also created entities
  let newItem = new MetadataEntity(id.toString());
  newItem.bpm = <i32>bpm.toI64();
  newItem.genre = genre.toString();
  newItem.keyScale = keyScale.toString();
  newItem.type = type.toString();
  newItem.save();
}

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
  entity.contentURI = event.params.contentURI;
  entity.timestamp = event.params.timestamp.toString();

  log.info("Hello 1 *************", []);
  let data = ipfs.cat(entity.contentURI);
  if (!data) return;
  log.info("Hello 2 *************: {}", [data.toHexString()]);
  let value = json.fromBytes(data);
  let parsedObj = value.toObject();
  if (!parsedObj) {
    log.error("Unable to parse beats Object", []);
    return;
  }
  const metadataId = parsedObj.get("metadata_id");
  if (!metadataId) {
    log.error("Unable to get metadata ID.", []);
    return;
  }
  const attributes = parsedObj.get("attributes");
  if (!attributes) {
    log.error("Unable to get attributes.", []);
    return;
  }
  const attributeArray = attributes.toArray();
  const genre = attributeArray[0].toString();
  const bpm = attributeArray[1].toI64();
  const keyScale = attributeArray[2].toString();
  const type = attributeArray[3].toString();
  if (!genre) {
    log.error("Unable to get genre.", []);
    return;
  }
  if (!bpm) {
    log.error("Unable to get bpm.", []);
    return;
  }
  if (!keyScale) {
    log.error("Unable to get keyscale.", []);
    return;
  }
  if (!type) {
    log.error("Unable to get type.", []);
    return;
  }

  let metadataEntity = MetadataEntity.load(metadataId.toString());
  if (!metadataEntity) {
    metadataEntity = new MetadataEntity(metadataId.toString());
  }
  metadataEntity.save();
  entity.metadata = metadataId.toString();

  entity.save();
}
