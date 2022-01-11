## Operational Scripts

### Queries

#### PHAC Statistics

`npm run stats:phac [-- -d]`

- `-d` : the last week period as default date range

```
$ npm run stats:phac

> ets operations@1.0.0 stats:phac
> ts-node src/queries/phac-stats.ts

? Start Date: 2022-01-02
? End Date: 2022-01-09
Results from 2022-01-02T08:00:00.000Z to 2022-01-10T08:00:00.000Z
All-Time Travellers: 478558
Travellers in Date Range: 3767
Air: 2863
Land: 451
Marine: 23
Unknown: 430
```