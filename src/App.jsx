import React, { useState } from 'react';
import './App.scss';
import cn from 'classnames';

import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';

function getPreparedProducts(products, filters) {
  const { filterByUser, searchQuery, filterByCategories } = filters;

  let preparedProducts = products.map((product) => {
    const category = categoriesFromServer.find(
      currentCategory => product.categoryId === currentCategory.id,
    ) || null;

    const user = usersFromServer.find(
      currentUser => category.ownerId === currentUser.id,
    ) || null;

    return {
      ...product,
      category,
      user,
    };
  });

  if (filterByUser) {
    preparedProducts = preparedProducts.filter(
      product => product.user.name === filterByUser,
    );
  }

  if (searchQuery) {
    const preparedQuery = searchQuery.toLowerCase();

    preparedProducts = preparedProducts.filter(
      product => product.name.toLowerCase().includes(preparedQuery),
    );
  }

  if (filterByCategories.length) {
    preparedProducts = preparedProducts.filter(
      product => filterByCategories.includes(product.category.title),
    );
  }

  return preparedProducts;
}

export const App = () => {
  const [filterByUser, setFilterByUser] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterByCategories, setFilterByCategories] = useState([]);

  const preparedProducts = getPreparedProducts(
    productsFromServer,
    { filterByUser, searchQuery, filterByCategories },
  );

  const resetAllFilters = () => {
    setFilterByUser('');
    setSearchQuery('');
    setFilterByCategories([]);
  };

  const selectCategory = (category) => {
    if (!filterByCategories.includes(category.title)) {
      setFilterByCategories(
        currentFilter => [...currentFilter, category.title],
      );
    }
  };

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">Product Categories</h1>

        <div className="block">
          <nav className="panel">
            <p className="panel-heading">Filters</p>

            <p className="panel-tabs has-text-weight-bold">
              <a
                data-cy="FilterAllUsers"
                href="#/"
                onClick={() => setFilterByUser('')}
                className={cn({ 'is-active': !filterByUser })}
              >
                All
              </a>

              {usersFromServer.map(user => (
                <a
                  data-cy="FilterUser"
                  href="#/"
                  onClick={() => {
                    setFilterByUser(user.name);
                  }}
                  key={user.id}
                  className={cn({ 'is-active': filterByUser === user.name })}
                >
                  {user.name}
                </a>
              ))}
            </p>

            <div className="panel-block">
              <p className="control has-icons-left has-icons-right">
                <input
                  data-cy="SearchField"
                  type="text"
                  className="input"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={event => setSearchQuery(event.target.value)}
                />

                <span className="icon is-left">
                  <i className="fas fa-search" aria-hidden="true" />
                </span>

                {searchQuery && (
                  <span className="icon is-right">
                    {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                    <button
                      data-cy="ClearButton"
                      type="button"
                      className="delete"
                      onClick={() => setSearchQuery('')}
                    />
                  </span>
                )}

              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                data-cy="AllCategories"
                className={cn(
                  'button is-success mr-6',
                  { 'is-outlined': filterByCategories.length },
                )}
                onClick={() => setFilterByCategories([])}
              >
                All
              </a>

              {categoriesFromServer.map(category => (
                <a
                  data-cy="Category"
                  className={cn(
                    'button mr-2 my-1',
                    { 'is-info': filterByCategories.includes(category.title) },
                  )}
                  href="#/"
                  key={category.id}
                  onClick={() => selectCategory(category)}
                >
                  {category.title}
                </a>
              ))}
            </div>

            <div className="panel-block">
              <a
                data-cy="ResetAllButton"
                href="#/"
                className="button is-link is-outlined is-fullwidth"
                onClick={resetAllFilters}
              >
                Reset all filters
              </a>
            </div>
          </nav>
        </div>

        <div className="box table-container">
          {preparedProducts.length
            ? (
              <table
                data-cy="ProductTable"
                className="table is-striped is-narrow is-fullwidth"
              >
                <thead>
                  <tr>
                    <th>
                      <span className="is-flex is-flex-wrap-nowrap">
                        ID

                        <a href="#/">
                          <span className="icon">
                            <i data-cy="SortIcon" className="fas fa-sort" />
                          </span>
                        </a>
                      </span>
                    </th>

                    <th>
                      <span className="is-flex is-flex-wrap-nowrap">
                        Product

                        <a href="#/">
                          <span className="icon">
                            <i data-cy="SortIcon" className="fas fa-sort-down" />
                          </span>
                        </a>
                      </span>
                    </th>

                    <th>
                      <span className="is-flex is-flex-wrap-nowrap">
                        Category

                        <a href="#/">
                          <span className="icon">
                            <i data-cy="SortIcon" className="fas fa-sort-up" />
                          </span>
                        </a>
                      </span>
                    </th>

                    <th>
                      <span className="is-flex is-flex-wrap-nowrap">
                        User

                        <a href="#/">
                          <span className="icon">
                            <i data-cy="SortIcon" className="fas fa-sort" />
                          </span>
                        </a>
                      </span>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {preparedProducts.map(product => (
                    <tr data-cy="Product" key={product.id}>
                      <td className="has-text-weight-bold" data-cy="ProductId">
                        {product.id}
                      </td>

                      <td data-cy="ProductName">{product.name}</td>
                      <td data-cy="ProductCategory">
                        {`${product.category.icon} - ${product.category.title}`}
                      </td>

                      <td
                        data-cy="ProductUser"
                        className={cn(
                          {
                            'has-text-danger': product.user.sex === 'f',
                            'has-text-link': product.user.sex === 'm'
                          },
                        )}
                      >
                        {product.user.name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
            : (
              <p data-cy="NoMatchingMessage">
                No products matching selected criteria
              </p>
            )
          }
        </div>
      </div>
    </div>
  );
};
