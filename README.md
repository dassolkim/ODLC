# ODLC: Open Data Lake Constructor for Specific Domain

With the recent increase in data disclosure, research using open data in various fields, such as machine learning and data analysis, is also rapidly increasing. Open data refers to public data that is mainly released by the government. It is generally disclosed through an open data portal and is managed in a data lake because of the characteristics of including raw data and distributing the data in a file format. A data lake that targets such open data is called an open data lake. In this paper, we propose a new framework for constructing an open data lake for a specific domain by federating the data distributed across multiple portals to increase open data utilization. We analyze data management methods of the existing open data portals and derive three problems: pre-processing complexity, platform dependency, and scale limitation that reduce usability. To solve the pre-processing complexity and scale limitation problems, we present the three-step automatic processing logic to which we applied the automation expansion function. We also propose the detailed processing logic according to the platform to solve the platform dependency problem. We then design and implement metadata management functions for an open data lake. Through experiments on real data portals, we confirmed that the proposed framework is an integrated solution that solves all problems previously derived and supports efficient management and construction of a data lake. To our best knowledge, our approach presents the first integrated framework that supports the construction and management of stable open data lakes, increases the utilization of open data, and solves the problem of research data scarcity.

Paper link: TBA

## Quick start

### Environment
 - Node: above v.16.14.2
 - Minio: Release.2022-10-08T20-11-00Z 
 - PostgreSQL: v.14.2

### Running
1. Download this source (git clone)
2. Execute npm install
3. Edit connectConfig.js (Object Storage Info, URL, Bucket, Keywords)
4. node ./main.js