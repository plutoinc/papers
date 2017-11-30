import * as React from "react";
import * as queryString from "query-string";
import { connect, DispatchProp } from "react-redux";
import { push } from "react-router-redux";
import { withRouter, RouteComponentProps } from "react-router-dom";
import { Container, Grid, Checkbox, Form, Button } from "semantic-ui-react";
import isEmpty = require("lodash.isempty");
import { Meteor } from "meteor/meteor";
import { Post } from "../../../both/model/post";
import PostList from "./components/postList";
import { mapSortOptionFromConditionObject, ISortOptions } from "./helpers";
import { getHavingStringTypeTrueAttributesFromObject } from "../../helpers/getTrueAttributes";
const { withTracker } = require("meteor/react-meteor-data");

declare var Counter: any;

const POSTS_PER_PAGE: number = 5;

interface IFeedProps extends RouteComponentProps<{}>, DispatchProp<any> {
  isLoading: boolean;
  posts: any;
  currentUser: any;
  isLoggingIn: boolean;
  users: any[];
  usersIsLoading: boolean;
  postCount: number;
  currentPage: number;
}

export interface IFeedState {
  newest?: boolean;
  ratingCount?: boolean;
  rating?: boolean;
  commentCount?: boolean;
  closeToICOEnd?: boolean;
  viewCount?: boolean;
  searchTerm?: string;
}

@withRouter
class Feed extends React.PureComponent<IFeedProps, IFeedState> {
  public state = {
    newest: true,
    ratingCount: false,
    rating: false,
    commentCount: false,
    closeToICOEnd: false,
    viewCount: false,
    searchTerm: "",
  };

  private changeSortOption = (_e: any, data: any) => {
    const newState = {
      ...this.state,
      ...{ [data.value]: data.checked },
    };

    this.setState(newState);
    this.makeNewPathAndPushLocation(newState);
  };

  private makeNewPathAndPushLocation = (object?: Object) => {
    const { location, dispatch } = this.props;

    const search = queryString.stringify(object);
    const pathWithSearch = `${location.pathname}?${search}`;
    dispatch(push(pathWithSearch));
  };

  private checkTrue = (value: string | boolean) => {
    if (typeof value === "string") {
      return value === "true";
    } else {
      return value;
    }
  };

  private handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { searchTerm } = this.state;

    this.changeSortOption("", { searchTerm });
  };

  private handleChangeSearchInput = (e: React.FormEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;

    this.setState({
      searchTerm: value,
    });
  };

  private handleChangePage = (page: number) => {
    const searchObject = { ...this.state, ...{ page } };
    this.makeNewPathAndPushLocation(searchObject);
  };

  private getPagination = () => {
    const { postCount, currentPage } = this.props;

    const paginationItems = [];

    const totalPage = Math.ceil(postCount / POSTS_PER_PAGE);
    const startPage = Math.floor(currentPage / 10) * 10 + 1;

    let beforePageArrow = null;
    let nextPageArrow = null;
    let endPage: number;

    if (startPage > 1) {
      beforePageArrow = (
        <span
          className="pagination-item"
          onClick={() => {
            this.handleChangePage(startPage - 10);
          }}
        >
          {"<"}
        </span>
      );
    }

    if (startPage + 9 > totalPage) {
      endPage = totalPage;
    } else if (startPage + 9 < 10) {
      endPage = totalPage;
    } else {
      nextPageArrow = (
        <span
          className="pagination-item"
          onClick={() => {
            this.handleChangePage(startPage + 10);
          }}
        >
          >
        </span>
      );
      endPage = startPage + 9;
    }

    for (let i = startPage; i < endPage; i++) {
      let paginationItemClassName;
      if (currentPage === i) {
        paginationItemClassName = "pagination-item active";
      } else {
        paginationItemClassName = "pagination-item";
      }

      paginationItems.push(
        <span
          key={`post_pagination_${i}`}
          className={paginationItemClassName}
          onClick={() => {
            this.handleChangePage(i);
          }}
        >
          {i}
        </span>,
      );
    }

    return (
      <div className="post-pagination-wrapper">
        {beforePageArrow}
        {paginationItems}
        {nextPageArrow}
      </div>
    );
  };

  public componentDidMount() {
    const { location } = this.props;

    const rawSearch = location.search;
    const search = queryString.parse(rawSearch);
    const initialState = { ...this.state, ...{ newest: false } };
    const newState = {
      ...initialState,
      ...search,
    };

    this.setState(newState);
  }

  public render() {
    const { posts, isLoading, currentUser, users, usersIsLoading } = this.props;
    const { searchTerm } = this.state;

    if (isLoading) {
      return null;
    } else {
      const { newest, ratingCount, rating, commentCount, closeToICOEnd, viewCount } = this.state;

      return (
        <div>
          <Container>
            <Form onSubmit={this.handleSearchSubmit}>
              <Form.Field>
                <Form.Input
                  placeholder="Search ICO or Whitepaper"
                  value={searchTerm}
                  onChange={this.handleChangeSearchInput}
                />
              </Form.Field>
              <Button size="tiny" floated="right" type="submit" primary>
                Search
              </Button>
            </Form>

            <Grid columns={2} divided>
              <Grid.Row>
                <Grid.Column width={4}>
                  <h2 className="sort-option-header">Show results for</h2>
                  <div className="sort-option-item">
                    <Checkbox
                      value="newest"
                      onChange={this.changeSortOption}
                      checked={this.checkTrue(newest)}
                      label={<label>Newest ICO</label>}
                    />
                  </div>
                  <div className="sort-option-item">
                    <Checkbox
                      value="rating"
                      onChange={this.changeSortOption}
                      checked={this.checkTrue(rating)}
                      label={<label>Best Rating ICO</label>}
                    />
                  </div>
                  <div className="sort-option-item">
                    <Checkbox
                      value="ratingCount"
                      onChange={this.changeSortOption}
                      checked={this.checkTrue(ratingCount)}
                      label={<label>Many Rating ICO</label>}
                    />
                  </div>
                  <div className="sort-option-item">
                    <Checkbox
                      value="closeToICOEnd"
                      onChange={this.changeSortOption}
                      checked={this.checkTrue(closeToICOEnd)}
                      label={<label>Close to end period ICO</label>}
                    />
                  </div>

                  <div className="sort-option-item">
                    <Checkbox
                      value="commentCount"
                      onChange={this.changeSortOption}
                      checked={this.checkTrue(commentCount)}
                      label={<label>Many Comments ICO</label>}
                    />
                  </div>

                  <div className="sort-option-item">
                    <Checkbox
                      value="viewCount"
                      onChange={this.changeSortOption}
                      checked={this.checkTrue(viewCount)}
                      label={<label>Many View Count</label>}
                    />
                  </div>
                </Grid.Column>
                <Grid.Column width={12}>
                  <PostList posts={posts} currentUser={currentUser} users={users} usersIsLoading={usersIsLoading} />
                </Grid.Column>
              </Grid.Row>
            </Grid>
            {this.getPagination()}
          </Container>
        </div>
      );
    }
  }
}

const FeedContainer = withTracker((params: IFeedProps) => {
  const rawSearch = params.location.search;
  const queryParamsObject = queryString.parse(rawSearch);

  // pagination
  const page = parseInt(queryParamsObject.page, 10);
  const currentPage = page >= 0 ? page : 1;
  const skip = (currentPage - 1) * POSTS_PER_PAGE;

  // Build subscribe options
  let sortOptions: ISortOptions = {};
  let subscribeOptions: any = {
    publishedAt: -1,
    limit: POSTS_PER_PAGE,
    skip,
  };

  if (!isEmpty(queryParamsObject)) {
    const sortConditions = getHavingStringTypeTrueAttributesFromObject(queryParamsObject);

    if (!isEmpty(sortConditions)) {
      sortOptions = mapSortOptionFromConditionObject(sortConditions);
    }
    subscribeOptions = { ...subscribeOptions, ...{ sort: sortOptions } };
  }

  // currentUser subscription
  const currentUser = Meteor.user();
  const isLoggingIn = Meteor.loggingIn();

  // Post subscription
  let postsHandle;
  if (queryParamsObject.searchTerm) {
    postsHandle = Meteor.subscribe("posts", subscribeOptions, queryParamsObject.searchTerm);
  } else {
    postsHandle = Meteor.subscribe("posts", subscribeOptions);
  }
  const isLoading = !postsHandle.ready();
  const posts = Post.find({}, { sort: sortOptions, limit: POSTS_PER_PAGE }).fetch();
  Meteor.subscribe("fullPostCount");
  const postCount = Counter.get("fullPostCount");

  // User subscription
  const userIds = posts.map((post: any) => post.userId);
  const userHandle = Meteor.subscribe("users", userIds);
  const users = Meteor.users.find({}).fetch();
  const usersIsLoading = !userHandle.ready();

  return {
    isLoading,
    posts,
    users,
    usersIsLoading,
    currentUser,
    isLoggingIn,
    postCount,
    currentPage,
    handlePageChange: () => {},
  };
})(connect()(Feed));

export default FeedContainer;
