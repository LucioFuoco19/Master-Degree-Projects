# Project Estimation

Date:

Version:

# Estimation approach

The following estimates assume that the project must be tackled from scratch. Factors such as course deadlines or already implemented features are therefore _not_ taken into account.

# Estimate by size

###

|                                                                                                         | Estimate |
| ------------------------------------------------------------------------------------------------------- | :------: |
| NC = Estimated number of classes to be developed                                                        |    10    |
| A = Estimated average size per class, in LOC                                                            |   200    |
| S = Estimated size of project, in LOC (= NC \* A)                                                       |  2.000   |
| E = Estimated effort, in person hours (here use productivity 10 LOC per person hour)                    |   200    |
| C = Estimated cost, in euro (here use 1 person hour cost = 30 euro)                                     |  6.000   |
| Estimated calendar time, in calendar weeks (Assume team of 4 people, 8 hours per day, 5 days per week ) |   1,25   |

Please note:

LOC _DO_ include:

- declarations
- blank lines

LOC _DO NOT_ include:

- comments

# Estimate by product decomposition

###

| component name       | Estimated effort (person hours) |
| -------------------- | :-----------------------------: |
| requirement document |               150               |
| design document      |               150               |
| code                 |               700               |
| unit tests           |               500               |
| api tests            |               300               |
| management documents |               150               |

# Estimate by activity decomposition

###

| Activity name                                   | Estimated effort (person hours) |
| ----------------------------------------------- | :-----------------------------: |
| User Requirements Gathering                     |               64                |
| Business Model Definition                       |               32                |
| Stakeholders Identification                     |               32                |
| Actors and Stories Definition                   |               32                |
| FR & NFR Definition                             |               128               |
| Use Cases Definition                            |               160               |
| Glossary Definition                             |               64                |
| Effort Estimation                               |               32                |
| ----------------------------------------        |              ----               |
| System Design                                   |               128               |
| Data Model Design                               |               64                |
| API Design                                      |               32                |
| GUI Prototype                                   |               32                |
| Deployment Diagram                              |               32                |
| ----------------------------------------        |              ----               |
| Development Environment Setup                   |               32                |
| CRUD implementation for data models             |               224               |
| End points implementation                       |               24                |
| GUI implementation                              |               56                |
| Database creation                               |               80                |
| Authentication and Authorization Implementation |               64                |
| ----------------------------------------        |              ----               |
| Unit Tests                                      |               144               |
| API Tests                                       |               144               |
| Functional Testing per Use Case                 |               64                |
| Edge-case Testing and Error Handling            |               64                |
| Integration Tests                               |               96                |
| ----------------------------------------        |              ----               |
| API Documentation                               |               80                |
| Technical System Documentation                  |               80                |
| Delivery and Presentation Preparation           |               96                |

## Gantt Chart

![Alt text](diagrams/depency_graph_diagram/depencygraph.svg)

# Summary

Report here the results of the three estimation approaches. The estimates may differ. Discuss here the possible reasons for the difference

|                                     | Estimated effort   | Estimated duration |
| ----------------------------------- | ------------------ | ------------------ |
| estimate by size                    | 200 person hours   | ca. 1 weeks 1 day  |
| estimate by product decomposition   | 1950 person hours  | ca. 12 weeks       |
| estimate by activity decomposition  | 1984 person-hours  | ca. 12 weeks       |

## Comment

Although estimates obtained through _product decomposition_ and _activity decomposition_ sum up to roughly the same effort, the _estimate by size_ shows a pretty significant difference. This discrepancy arises because this approach only takes into account activities related to classes implementation, which is just one among all the activities required to address the completion of this system.
