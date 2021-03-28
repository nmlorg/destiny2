export class User {
  constructor(bungie, rawData) {
    this.bungie = bungie;
    this.rawData = rawData;
    this.memberships = rawData.destinyMemberships.map(data => new Membership(this, data));
    for (let membership of this.memberships)
      if (membership.rawData.membershipId == rawData.primaryMembershipId) {
        this.primaryMembership = membership;
        break;
      }
  }
}


class Membership {
  constructor(user, rawData) {
    this.user = user;
    this.rawData = rawData;
    this.profiledata = {};
  }

  async getCharacters() {
    if (!this.characters_) {
      let data = await this.user.bungie.net.platform.destiny2[this.rawData.membershipType].profile[this.rawData.membershipId](
          {components: 'Characters,CharacterEquipment,CharacterInventories'});
      this.characters_ = {};
      for (let [characterId, characterData] of Object.entries(data.Response.characters.data))
        this.characters_[characterId] = new Character(
            this, characterData, data.Response.characterEquipment.data[characterId].items,
            data.Response.characterInventories.data[characterId].items);
    }
    return this.characters_;
  }
}


class Character {
  constructor(membership, rawCharacter, rawEquipment, rawInventory) {
    this.membership = membership;
    this.rawCharacter = rawCharacter;
    this.rawItems = rawEquipment.concat(rawInventory);
  }

  buildEmblem() {
    let div = document.createElement('div');
    div.appendChild(document.createElement('img')).src = this.membership.user.bungie.iconUrl(this.rawCharacter.emblemBackgroundPath);
    div.appendChild(document.createTextNode(this.rawCharacter.characterId));
    div.addEventListener('click', e => console.log(this));
    return div;
  }

  getItemsByBucket() {
    let buckets = {};
    for (let item of this.rawItems) {
      if (!buckets[item.bucketHash])
        buckets[item.bucketHash] = [];
      buckets[item.bucketHash].push(item);
    }
    return buckets;
  }
}
